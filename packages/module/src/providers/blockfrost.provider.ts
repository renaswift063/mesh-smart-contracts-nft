import axios, { AxiosInstance } from 'axios';
import { SUPPORTED_NETWORKS } from '@mesh/common/constants';
import { IFetcher, ISubmitter } from '@mesh/common/contracts';
import { parseHttpError, toBytes } from '@mesh/common/utils';
import type { AssetMetadata, Protocol, UTxO } from '@mesh/common/types';

export class BlockfrostProvider implements IFetcher, ISubmitter {
  private readonly _axiosInstance: AxiosInstance;

  constructor(projectId: string, networkId: number, version = 0) {
    const network = SUPPORTED_NETWORKS.get(networkId) ?? 'testnet';

    this._axiosInstance = axios.create({
      baseURL: `https://cardano-${network}.blockfrost.io/api/v${version}`,
      headers: { project_id: projectId },
    });
  }

  async fetchAssetMetadata(_asset: string): Promise<AssetMetadata> {
    throw new Error('Method not implemented.');
  }

  async fetchAssetUtxosFromAddress(asset: string, address: string): Promise<UTxO[]> {
    try {
      const { data, status } = await this._axiosInstance.get(
        `addresses/${address}/utxos/${asset}`
      );

      if (status === 200)
        return data.map((utxo) => (
        {
          input: {
            outputIndex: utxo.output_index,
            txHash: utxo.tx_hash,
          },
          output: {
            address: address,
            amount: utxo.amount,
            dataHash: utxo.data_hash ?? undefined,
          },
        }
      ) as UTxO);

      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }

  async fetchHandleAddress(_handle: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async fetchProtocolParameters(epoch = Number.NaN): Promise<Protocol> {
    try {
      const { data, status } = await this._axiosInstance.get(
        `epochs/${isNaN(epoch) ? 'latest' : epoch}/parameters`
      );

      if (status === 200)
        return {
          coinsPerUTxOSize: data.coins_per_utxo_word,
          collateralPercent: data.collateral_percent,
          decentralisation: data.decentralisation_param,
          epoch: data.epoch,
          keyDeposit: data.key_deposit,
          maxBlockExMem: data.max_block_ex_mem,
          maxBlockExSteps: data.max_block_ex_steps,
          maxBlockHeaderSize: data.max_block_header_size,
          maxBlockSize: data.max_block_size,
          maxCollateralInputs: data.max_collateral_inputs,
          maxTxExMem: data.max_tx_ex_mem,
          maxTxExSteps: data.max_tx_ex_steps,
          maxTxSize: data.max_tx_size,
          maxValSize: data.max_val_size,
          minFeeA: data.min_fee_a,
          minFeeB: data.min_fee_b,
          minPoolCost: data.min_pool_cost,
          poolDeposit: data.pool_deposit,
          priceMem: data.price_mem,
          priceStep: data.price_step,
        } as Protocol;

      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }

  async submitTx(tx: string): Promise<string> {
    try {
      const headers = { 'Content-Type': 'application/cbor' };
      const { data, status } = await this._axiosInstance.post(
        'tx/submit', toBytes(tx), { headers },
      );

      if (status === 200)
        return data as string;

      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
}
