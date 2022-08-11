import { csl } from '@mesh/core';
import { WalletService } from '@mesh/wallet';
import {
  DEFAULT_PROTOCOL_PARAMETERS, DEFAULT_REDEEMER_BUDGET,
} from '@mesh/common/constants';
import { Checkpoint, Trackable, TrackableObject } from '@mesh/common/decorators';
import {
  buildTxBuilder, buildTxInputsBuilder, buildTxOutputBuilder,
  deserializeEd25519KeyHash, deserializePlutusScript, fromBytes,
  fromTxUnspentOutput, resolveAddressKeyHash, toAddress,
  toPlutusData, toRedeemer, toTxUnspentOutput, toValue,
} from '@mesh/common/utils';
import type { Address, TransactionBuilder, TxInputsBuilder } from '@mesh/core';
import type { Action, Asset, Data, Protocol, UTxO } from '@mesh/common/types';

@Trackable
export class TransactionService {
  private _changeAddress: Address | null = null;

  private readonly _signatures: Set<string>;
  private readonly _txBuilder: TransactionBuilder;
  private readonly _txInputsBuilder: TxInputsBuilder;
  private readonly _walletService?: WalletService;

  constructor(options = {} as Partial<CreateTxOptions>) {
    this._signatures = new Set<string>();
    this._txBuilder = buildTxBuilder(options.parameters);
    this._txInputsBuilder = csl.TxInputsBuilder.new();
    this._walletService = options.walletService;
  }

  async build(): Promise<string> {
    try {
      if (this.notVisited('redeemFromScript') === false) {
        await this.addCollateralIfNeeded();
        await this.addRequiredSigners();
      }

      await this.addTxInputsAsNeeded();
      await this.addChangeAddressIfNeeded();
      return fromBytes(this._txBuilder.build_tx().to_bytes());
    } catch (error) {
      throw error;
    }
  }

  @Checkpoint()
  redeemFromScript(
    value: UTxO, script: string,
    options = {} as Partial<RedeemFromScriptOptions>
  ): TransactionService {
    const utxo = toTxUnspentOutput(value);
    const datum: Data = options.datum ?? { fields: [] };
    const redeemer: Action = {
      alternative: 0,
      budget: DEFAULT_REDEEMER_BUDGET,
      data: { fields: [] } as Data,
      index: value.input.outputIndex,
      tag: 'SPEND',
      ...options.redeemer,
    };

    const plutusWitness = csl.PlutusWitness.new(
      deserializePlutusScript(script),
      toPlutusData(datum),
      toRedeemer(redeemer),
    );

    this._txInputsBuilder.add_plutus_script_input(
      plutusWitness, utxo.input(), utxo.output().amount()
    );

    return this;
  }

  @Checkpoint()
  sendAssets(
    address: string, assets: Asset[],
    options = {} as Partial<SendAssetsOptions>
  ): TransactionService {
    const amount = toValue(assets);
    const multiasset = amount.multiasset();

    if (amount.is_zero() || multiasset === undefined)
      return this;

    const txOutputBuilder = buildTxOutputBuilder(address, options.datum);

    const txOutput = txOutputBuilder.next()
      .with_asset_and_min_required_coin_by_utxo_cost(
        multiasset,
        csl.DataCost.new_coins_per_byte(
          csl.BigNum.from_str(
            options.coinsPerByte ?? DEFAULT_PROTOCOL_PARAMETERS.coinsPerUTxOSize
          )
        )
      )
      .build();

    this._txBuilder.add_output(txOutput);

    return this;
  }

  sendLovelace(
    address: string, lovelace: string,
    options = {} as Partial<SendLovelaceOptions>
  ): TransactionService {
    const txOutputBuilder = buildTxOutputBuilder(address, options.datum);

    const txOutput = txOutputBuilder.next()
      .with_coin(csl.BigNum.from_str(lovelace))
      .build();

    this._txBuilder.add_output(txOutput);

    return this;
  }

  @Checkpoint()
  sendValue(
    address: string, value: UTxO,
    options = {} as Partial<SendValueOptions>
  ): TransactionService {
    const amount = toValue(value.output.amount);
    const txOutputBuilder = buildTxOutputBuilder(address, options.datum);

    const txOutput = txOutputBuilder.next()
      .with_value(amount)
      .build();

    this._txBuilder.add_output(txOutput);

    return this;
  }

  @Checkpoint()
  setChangeAddress(address: string): TransactionService {
    this._changeAddress = toAddress(address);

    return this;
  }

  @Checkpoint()
  setCollateral(collateral: UTxO[]): TransactionService {
    const txInputsBuilder = buildTxInputsBuilder(collateral);

    this.addSignaturesFrom(collateral);
    this._txBuilder.set_collateral(txInputsBuilder);

    return this;
  }

  setMetadata(key: number, json: string): TransactionService {
    this._txBuilder.add_json_metadatum_with_schema(
      csl.BigNum.from_str(key.toString()),
      json, csl.MetadataJsonSchema.DetailedSchema
    );

    return this;
  }

  setTimeToLive(slot: string): TransactionService {
    this._txBuilder.set_ttl_bignum(csl.BigNum.from_str(slot));

    return this;
  }

  @Checkpoint()
  setTxInputs(inputs: UTxO[]): TransactionService {
    this.addSignaturesFrom(inputs);

    inputs
      .map((input) => toTxUnspentOutput(input))
      .forEach((utxo) => {
        this._txInputsBuilder.add_input(
          utxo.output().address(),
          utxo.input(),
          utxo.output().amount()
        );
      });

    return this;
  }

  private async addChangeAddressIfNeeded() {
    if (this._walletService && this.notVisited('setChangeAddress')) {
      const changeAddress = await this._walletService.getChangeAddress();
      this._txBuilder.add_change_if_needed(toAddress(changeAddress));
    } else if (this._changeAddress !== null) {
      this._txBuilder.add_change_if_needed(this._changeAddress);
    }
  }

  private async addCollateralIfNeeded() {
    if (this._walletService && this.notVisited('setCollateral')) {
      const collateral = await this._walletService
        .getDeserializedCollateral();

      this.addSignaturesFrom(collateral.map((c) => fromTxUnspentOutput(c)));
      this._txBuilder.set_collateral(buildTxInputsBuilder(collateral));
    }
  }

  private async addTxInputsAsNeeded() {
    this._txBuilder.set_inputs(this._txInputsBuilder);

    if (this.notVisited('redeemFromScript') === false) {
      const costModels = csl.TxBuilderConstants.plutus_vasil_cost_models();
      this._txBuilder.calc_script_data_hash(costModels);
    }

    if (this.notVisited('setTxInputs')) {
      const walletUtxos = await this.getWalletUtxos();

      const includeMultiAsset =
        !this.notVisited('sendAssets') || !this.notVisited('sendValue');

      const coinSelectionStrategy = includeMultiAsset
        ? csl.CoinSelectionStrategyCIP2.LargestFirstMultiAsset
        : csl.CoinSelectionStrategyCIP2.LargestFirst;

      this._txBuilder.add_inputs_from(walletUtxos, coinSelectionStrategy);
    }
  }

  private async getWalletUtxos() {
    const txUnspentOutputs = csl.TransactionUnspentOutputs.new();

    if (this._walletService === undefined)
      return txUnspentOutputs;

    const walletUtxos = await this._walletService
      .getDeserializedUtxos();

    walletUtxos.forEach((utxo) => {
      txUnspentOutputs.add(utxo);
    });

    return txUnspentOutputs;
  }

  private async addRequiredSigners() {
    const keys = csl.Ed25519KeyHashes.new();

    this._signatures.forEach((signature) => {
      keys.add(deserializeEd25519KeyHash(signature));
    });

    this._txInputsBuilder.add_required_signers(keys);
  }

  private addSignaturesFrom(inputs: UTxO[]) {
    inputs
      .forEach((input) => {
        const address = input.output.address;
        const keyHash = resolveAddressKeyHash(address);
        this._signatures.add(keyHash);
      });
  }

  private notVisited(checkpoint: string) {
    return (
      (this as unknown as TrackableObject).__visits
        .includes(checkpoint) === false
    );
  }
}

type CreateTxOptions = {
  parameters: Protocol;
  walletService: WalletService;
};

type RedeemFromScriptOptions = {
  datum: Data;
  redeemer: Action;
};

type SendAssetsOptions = {
  coinsPerByte: string;
  datum: Data;
};

type SendLovelaceOptions = {
  datum: Data;
};

type SendValueOptions = {
  datum: Data;
};
