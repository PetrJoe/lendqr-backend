import knex from 'knex';
import { env } from './env';

export const db = knex({
  client: 'pg',
  connection: {
    connectionString: env.db.url,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  },
  pool: { min: 2, max: 10 },
});
