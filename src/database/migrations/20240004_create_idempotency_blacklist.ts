import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('idempotency_keys', (t) => {
    t.string('id', 36).primary();
    t.string('key', 255).notNullable().unique();
    t.string('operation', 50).notNullable();
    t.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('request_hash', 64).notNullable();
    t.json('response_json').nullable();
    t.enum('status', ['PENDING', 'COMPLETED', 'FAILED']).notNullable().defaultTo('PENDING');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('expires_at').nullable();
  });

  await knex.schema.createTable('blacklist_checks', (t) => {
    t.string('id', 36).primary();
    t.string('user_email', 255).nullable();
    t.string('user_phone', 20).nullable();
    t.string('provider', 50).notNullable().defaultTo('ADJUTOR_KARMA');
    t.boolean('is_blacklisted').notNullable();
    t.json('provider_response_json').nullable();
    t.timestamp('checked_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('blacklist_checks');
  await knex.schema.dropTableIfExists('idempotency_keys');
}
