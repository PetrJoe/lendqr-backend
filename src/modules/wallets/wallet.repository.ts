import { Knex } from 'knex';
import { db } from '../../config/db';
import { generateId } from '../../shared/utils/helpers';

export interface Wallet {
  id: string;
  user_id: string;
  balance_minor: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export const WalletRepository = {
  findByUserId: (user_id: string, trx?: Knex.Transaction) =>
    (trx || db)<Wallet>('wallets').where({ user_id }).first(),

  findByUserIdForUpdate: (user_id: string, trx: Knex.Transaction) =>
    trx<Wallet>('wallets').where({ user_id }).forUpdate().first(),

  findByIdForUpdate: (id: string, trx: Knex.Transaction) =>
    trx<Wallet>('wallets').where({ id }).forUpdate().first(),

  create: async (user_id: string, trx?: Knex.Transaction) => {
    const id = generateId();
    const conn = trx || db;
    await conn('wallets').insert({ id, user_id, balance_minor: 0, currency: 'NGN' });
    return (trx || db)<Wallet>('wallets').where({ id }).first() as Promise<Wallet>;
  },

  updateBalance: (id: string, balance_minor: number, trx: Knex.Transaction) =>
    trx('wallets').where({ id }).update({ balance_minor, updated_at: db.fn.now() }),
};
