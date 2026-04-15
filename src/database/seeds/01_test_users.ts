import type { Knex } from 'knex';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();

  const userId1 = crypto.randomUUID();
  const userId2 = crypto.randomUUID();
  const walletId1 = crypto.randomUUID();
  const walletId2 = crypto.randomUUID();
  const hash = await bcrypt.hash('Password123!', 10);

  await knex('users').insert([
    { id: userId1, first_name: 'Alice', last_name: 'Test', email: 'alice@test.com', phone: '08000000001', password_hash: hash },
    { id: userId2, first_name: 'Bob', last_name: 'Test', email: 'bob@test.com', phone: '08000000002', password_hash: hash },
  ]);

  await knex('wallets').insert([
    { id: walletId1, user_id: userId1, balance_minor: 100000, currency: 'NGN' },
    { id: walletId2, user_id: userId2, balance_minor: 50000, currency: 'NGN' },
  ]);
}
