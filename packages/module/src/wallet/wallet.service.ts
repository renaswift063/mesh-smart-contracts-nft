import { csl } from '../core';
import { MAX_COLLATERAL, POLICY_ID_LENGTH } from '../common/constants';
import {
  deserializeAddress, deserializeTx, deserializeTxWitnessSet,
  deserializeTxUnspentOutput, deserializeValue, fromBytes,
  fromTxUnspentOutput, fromValue, toASCII, resolveFingerprint,
} from '../common/utils';
import type { TransactionUnspentOutput } from '../core';
import type { Asset, AssetExtended, UTxO, Wallet } from '../common/types';

export class WalletService {
  private constructor(private readonly _walletInstance: WalletInstance) {}

  static supportedWallets = ['flint', 'nami', 'eternl', 'nufi'];

  static getInstalledWallets(): Wallet[] {
    if (window.cardano === undefined) return [];

    return WalletService.supportedWallets
      .filter((sw) => window.cardano[sw] !== undefined)
      .map((sw) => ({
        name: window.cardano[sw].name,
        icon: window.cardano[sw].icon,
        version: window.cardano[sw].apiVersion,
      }));
  }

  static async enable(walletName: string): Promise<WalletService> {    
    try {
      const walletInstance = await WalletService.resolveInstance(walletName);

      if (walletInstance !== undefined)
        return new WalletService(walletInstance);

      throw new Error(`Couldn't create an instance of wallet: ${walletName}.`);
    } catch (error) {
      throw error;
    }
  }

  async getBalance(): Promise<Asset[]> {
    const balance = await this._walletInstance.getBalance();
    return fromValue(deserializeValue(balance));
  }

  async getChangeAddress(): Promise<string> {
    const changeAddress = await this._walletInstance.getChangeAddress();
    return deserializeAddress(changeAddress).to_bech32();
  }

  async getCollateral(limit = MAX_COLLATERAL): Promise<UTxO[]> {
    const deserializedCollateral = await this.getDeserializedCollateral(limit);
    return deserializedCollateral.map((dc) => fromTxUnspentOutput(dc));
  }

  async getDeserializedCollateral(limit = MAX_COLLATERAL): Promise<TransactionUnspentOutput[]> {
    const collateral = (await this._walletInstance.experimental.getCollateral()) ?? [];
    return collateral.map((c) => deserializeTxUnspentOutput(c)).slice(0, limit);
  }

  getNetworkId(): Promise<number> {
    return this._walletInstance.getNetworkId();
  }

  async getRewardAddresses(): Promise<string[]> {
    const rewardAddresses = await this._walletInstance.getRewardAddresses();
    return rewardAddresses.map((ra) => deserializeAddress(ra).to_bech32());
  }

  async getUnusedAddresses(): Promise<string[]> {
    const unusedAddresses = await this._walletInstance.getUnusedAddresses();
    return unusedAddresses.map((una) => deserializeAddress(una).to_bech32());
  }

  async getUsedAddresses(): Promise<string[]> {
    const usedAddresses = await this._walletInstance.getUsedAddresses();
    return usedAddresses.map((usa) => deserializeAddress(usa).to_bech32());
  }

  async getUtxos(): Promise<UTxO[]> {
    const deserializedUtxos = await this.getDeserializedUtxos();
    return deserializedUtxos.map((du) => fromTxUnspentOutput(du));
  }

  async getDeserializedUtxos(): Promise<TransactionUnspentOutput[]> {
    const utxos = (await this._walletInstance.getUtxos()) ?? [];
    return utxos.map((u) => deserializeTxUnspentOutput(u));
  }

  async signData(payload: string): Promise<string> {
    const changeAddress = await this._walletInstance.getChangeAddress();
    return this._walletInstance.signData(changeAddress, payload);
  }

  async signTx(unsignedTx: string, partialSign = false): Promise<string> {
    try {
      const tx = deserializeTx(unsignedTx);
      const txWitnessSet = deserializeTxWitnessSet(
        fromBytes(tx.witness_set().to_bytes())
      );

      const walletWitnessSet = await this._walletInstance.signTx(
        unsignedTx, partialSign
      );

      const walletVerificationKeys = deserializeTxWitnessSet(walletWitnessSet).vkeys();
      if (walletVerificationKeys !== undefined)
        txWitnessSet.set_vkeys(walletVerificationKeys);

      const signedTx = fromBytes(
        csl.Transaction.new(
          tx.body(),
          txWitnessSet,
          tx.auxiliary_data()
        ).to_bytes()
      );

      return signedTx;
    } catch (error) {
      throw error;
    }
  }

  submitTx(tx: string): Promise<string> {
    return this._walletInstance.submitTx(tx);
  }

  async getAssets(): Promise<AssetExtended[]> {
    const balance = await this.getBalance();
    return balance
      .filter((v) => v.unit !== 'lovelace')
      .map((v) => {
        const policyId = v.unit.slice(0, POLICY_ID_LENGTH);
        const assetName = v.unit.slice(POLICY_ID_LENGTH);
        const fingerprint = resolveFingerprint(policyId, assetName);

        return {
          unit: v.unit,
          policyId,
          assetName: toASCII(assetName),
          fingerprint,
          quantity: v.quantity
        };
      });
  }

  async getLovelace(): Promise<string> {
    const balance = await this.getBalance();
    const nativeAsset = balance.find((v) => v.unit === 'lovelace');

    return nativeAsset !== undefined ? nativeAsset.quantity : '0';
  }

  async getPolicyIdAssets(policyId: string): Promise<AssetExtended[]> {
    const assets = await this.getAssets();
    return assets.filter((v) => v.policyId === policyId);
  }

  async getPolicyIds(): Promise<string[]> {
    const balance = await this.getBalance();
    return Array.from(
      new Set(balance.map((v) => v.unit.slice(0, POLICY_ID_LENGTH)))
    ).filter((p) => p !== 'lovelace');
  }

  private static resolveInstance(
    walletName: string
  ): Promise<WalletInstance> | undefined {
    if (window.cardano === undefined) return undefined;

    const wallet: WalletProvider | undefined = WalletService.supportedWallets
      .map((sw) => window.cardano[sw])
      .filter((sw) => sw !== undefined)
      .find((sw) => sw.name === walletName);

    return wallet?.enable();
  }
}

type WalletProvider = {
  name: string;
  icon: string;
  version: string;
  enable: () => Promise<WalletInstance>;
};

type WalletInstance = {
  experimental: ExperimentalFeatures;
  getBalance(): Promise<string>;
  getChangeAddress(): Promise<string>;
  getNetworkId(): Promise<number>;
  getRewardAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getUsedAddresses(): Promise<string[]>;
  getUtxos(): Promise<string[] | undefined>;
  signData(address: string, payload: string): Promise<string>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(tx: string): Promise<string>;
};

type ExperimentalFeatures = {
  getCollateral(): Promise<string[] | undefined>;
};
