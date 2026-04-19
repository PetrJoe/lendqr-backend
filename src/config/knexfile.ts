import type { Knex } from 'knex';
import { env } from './env';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    connectionString: env.db.url,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    directory: '../database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: '../database/seeds',
    extension: 'ts',
  },
};

export default config;
