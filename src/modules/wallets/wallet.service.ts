import { db } from '../../config/db';
import { WalletRepository } from './wallet.repository';
import { TransactionRepository } from '../transactions/transaction.repository';
import { UserRepository } from '../users/user.repository';
import { Errors } from '../../shared/errors/AppError';
import { toMinorUnit, fromMinorUnit, generateReference } from '../../shared/utils/helpers';
import type { WalletOperationInput, TransferInput } from './wallet.types';
import type { TransactionType } from '../transactions/transaction.repository';

/** Shared logic for fund and withdraw — both mutate a single wallet atomically. */
async function singleWalletMutation(
  userId: string,
  input: WalletOperationInput,
  type: TransactionType,
  direction: 'credit' | 'debit',
) {
  const amountMinor = toMinorUnit(input.amount);
  const prefix = type === 'FUND' ? 'FUND' : 'WDR';
  const reference = input.reference || generateReference(prefix);

  return db.transaction(async (trx) => {
    const wallet = await WalletRepository.findByUserIdForUpdate(userId, trx);
    if (!wallet) throw Errors.walletNotFound();
    if (direction === 'debit' && wallet.balance_minor < amountMinor) throw Errors.insufficientFunds();

    const newBalance =
      direction === 'credit'
        ? wallet.balance_minor + amountMinor
        : wallet.balance_minor - amountMinor;

    await WalletRepository.updateBalance(wallet.id, newBalance, trx);
    const txn = await TransactionRepository.create(
      {
        wallet_id: wallet.id,
        type,
        amount_minor: amountMinor,
        balance_before_minor: wallet.balance_minor,
        balance_after_minor: newBalance,
        reference,
        related_reference: null,
        metadata_json: null,
      },
      trx,
    );

    return {
      reference: txn.reference,
      balance_before: fromMinorUnit(wallet.balance_minor),
      balance_after: fromMinorUnit(newBalance),
      currency: wallet.currency,
    };
  });
}

export const WalletService = {
  getBalance: async (userId: string) => {
    const wallet = await WalletRepository.findByUserId(userId);
    if (!wallet) throw Errors.walletNotFound();
    return { balance: fromMinorUnit(wallet.balance_minor), currency: wallet.currency };
  },

  fund: (userId: string, input: WalletOperationInput) =>
    singleWalletMutation(userId, input, 'FUND', 'credit'),

  withdraw: (userId: string, input: WalletOperationInput) =>
    singleWalletMutation(userId, input, 'WITHDRAW', 'debit'),

  transfer: async (senderId: string, input: TransferInput) => {
    const amountMinor = toMinorUnit(input.amount);
    const baseRef = input.reference || generateReference('TRF');
    const debitRef = `${baseRef}-DEBIT`;
    const creditRef = `${baseRef}-CREDIT`;

    const receiver = await UserRepository.findByEmail(input.receiver_email);
    if (!receiver) throw Errors.userNotFound();
    if (receiver.id === senderId) throw Errors.selfTransfer();

    return db.transaction(async (trx) => {
      // Lock in deterministic order to prevent deadlocks
      const senderWallet = await WalletRepository.findByUserIdForUpdate(senderId, trx);
      if (!senderWallet) throw Errors.walletNotFound();

      const receiverWallet = await WalletRepository.findByUserIdForUpdate(receiver.id, trx);
      if (!receiverWallet) throw Errors.walletNotFound();

      if (senderWallet.balance_minor < amountMinor) throw Errors.insufficientFunds();

      const senderNewBalance = senderWallet.balance_minor - amountMinor;
      const receiverNewBalance = receiverWallet.balance_minor + amountMinor;

      await WalletRepository.updateBalance(senderWallet.id, senderNewBalance, trx);
      await WalletRepository.updateBalance(receiverWallet.id, receiverNewBalance, trx);

      await TransactionRepository.create(
        {
          wallet_id: senderWallet.id,
          type: 'TRANSFER_DEBIT',
          amount_minor: amountMinor,
          balance_before_minor: senderWallet.balance_minor,
          balance_after_minor: senderNewBalance,
          reference: debitRef,
          related_reference: creditRef,
          metadata_json: { receiver_email: input.receiver_email },
        },
        trx,
      );

      await TransactionRepository.create(
        {
          wallet_id: receiverWallet.id,
          type: 'TRANSFER_CREDIT',
          amount_minor: amountMinor,
          balance_before_minor: receiverWallet.balance_minor,
          balance_after_minor: receiverNewBalance,
          reference: creditRef,
          related_reference: debitRef,
          metadata_json: { sender_id: senderId },
        },
        trx,
      );

      return {
        reference: baseRef,
        balance_before: fromMinorUnit(senderWallet.balance_minor),
        balance_after: fromMinorUnit(senderNewBalance),
        currency: senderWallet.currency,
      };
    });
  },

  getTransactions: (userId: string, type?: string, page = 1, limit = 20) =>
    db('wallets')
      .where({ user_id: userId })
      .first()
      .then((wallet) => {
        if (!wallet) throw Errors.walletNotFound();
        return TransactionRepository.findByWalletId(wallet.id, type, page, limit);
      }),
};
