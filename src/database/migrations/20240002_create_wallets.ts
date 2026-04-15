import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('wallets', (t) => {
    t.string('id', 36).primary();
    t.string('user_id', 36).notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    t.bigInteger('balance_minor').notNullable().defaultTo(0);
    t.string('currency', 10).notNullable().defaultTo('NGN');
    t.timestamps(true, true);
    t.index(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallets');
}
