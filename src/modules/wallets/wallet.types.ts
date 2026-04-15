export interface WalletOperationInput {
  amount: number; // in major unit (e.g. NGN)
  reference?: string;
}

export interface TransferInput extends WalletOperationInput {
  receiver_email: string;
}
