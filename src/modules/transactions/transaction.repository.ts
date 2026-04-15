import { Knex } from 'knex';
import { db } from '../../config/db';
import { generateId } from '../../shared/utils/helpers';

export type TransactionType = 'FUND' | 'TRANSFER_DEBIT' | 'TRANSFER_CREDIT' | 'WITHDRAW';

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount_minor: number;
  balance_before_minor: number;
  balance_after_minor: number;
  reference: string;
  related_reference: string | null;
  metadata_json: unknown;
  created_at: Date;
}

export const TransactionRepository = {
  create: async (
    data: Omit<Transaction, 'id' | 'created_at'>,
    trx: Knex.Transaction,
  ): Promise<Transaction> => {
    const id = generateId();
    await trx('transactions').insert({ id, ...data });
    return trx<Transaction>('transactions').where({ id }).first() as Promise<Transaction>;
  },

  findByWalletId: (wallet_id: string, type?: string, page = 1, limit = 20) => {
    const query = db<Transaction>('transactions').where({ wallet_id }).orderBy('created_at', 'desc');
    if (type) query.where({ type });
    return query.limit(limit).offset((page - 1) * limit);
  },

  findByReference: (reference: string) =>
    db<Transaction>('transactions').where({ reference }).first(),
};
