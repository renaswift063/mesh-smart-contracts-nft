import { csl } from '../../core/cardano';
import { toBytes } from './converter';

export const deserializeAddress = (address: string) => csl.Address
  .from_bytes(toBytes(address));

export const deserializeDataHash = (dataHash: string) => csl.DataHash
  .from_bytes(toBytes(dataHash));

export const deserializeEd25519KeyHash = (ed25519KeyHash: string) => csl.Ed25519KeyHash
  .from_bytes(toBytes(ed25519KeyHash));

export const deserializePlutusData = (plutusData: string) => csl.PlutusData
  .from_bytes(toBytes(plutusData));

export const deserializePlutusScript = (plutusScript: string) => csl.PlutusScript
  .from_bytes(toBytes(plutusScript));

export const deserializeScriptRef = (scriptRef: string) => csl.ScriptRef
  .from_bytes(toBytes(scriptRef));

export const deserializeScriptHash = (scriptHash: string) => csl.ScriptHash
  .from_bytes(toBytes(scriptHash));

export const deserializeTx = (tx: string) => csl.Transaction
  .from_bytes(toBytes(tx));

export const deserializeTxHash = (txHash: string) => csl.TransactionHash
  .from_bytes(toBytes(txHash));

export const deserializeTxUnspentOutput = (txUnspentOutput: string) => csl.TransactionUnspentOutput
  .from_bytes(toBytes(txUnspentOutput));

export const deserializeTxWitnessSet = (txWitnessSet: string) => csl.TransactionWitnessSet
  .from_bytes(toBytes(txWitnessSet));

export const deserializeValue = (value: string) => csl.Value
  .from_bytes(toBytes(value));
