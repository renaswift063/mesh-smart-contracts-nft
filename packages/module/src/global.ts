export const MIN_ADA_REQUIRED = 1000000;
export const MIN_ADA_REQUIRED_WITH_ASSETS = 2000000;
export const ADA_BUFFER_REQUIRED = 2000000;
export const IPFS_PROVIDER = 'https://infura-ipfs.io/ipfs/';

export const TxSignError = {
  WrongPassword: 'Wrong password',
  ProofGeneration:
    'User has accepted the transaction sign, but the wallet was unable to sign the transaction (e.g. not having some of the private keys).',
};

export const MakeTxError = {
  NotEnoughLovelaceInput:
    'Not enough lovelace to complete this transaction.',
  NotEnoughAssetsInput:
    'Not enough assets in the inputs to complete this transaction.',
  InputNotEqualOutput: 'Input not equal to output',
  LovelaceTooLittle: 'Lovelace must be greater than 1000000',
  NoRecipientsAddress: 'Missing recipient address',
};
