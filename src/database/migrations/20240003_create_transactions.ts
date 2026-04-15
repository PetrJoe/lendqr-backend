import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (t) => {
    t.string('id', 36).primary();
    t.string('wallet_id', 36).notNullable().references('id').inTable('wallets').onDelete('CASCADE');
    t.enum('type', ['FUND', 'TRANSFER_DEBIT', 'TRANSFER_CREDIT', 'WITHDRAW']).notNullable();
    t.bigInteger('amount_minor').notNullable();
    t.bigInteger('balance_before_minor').notNullable();
    t.bigInteger('balance_after_minor').notNullable();
    t.string('reference', 100).notNullable().unique();
    t.string('related_reference', 100).nullable();
    t.json('metadata_json').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['wallet_id']);
    t.index(['reference']);
    t.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
