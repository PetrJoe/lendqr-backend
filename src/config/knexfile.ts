import type { Knex } from 'knex';
import path from 'path';
import { env } from './env';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    connectionString: env.db.url,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    directory: path.resolve(process.cwd(), 'src/database/migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.resolve(process.cwd(), 'src/database/seeds'),
    extension: 'ts',
  },
};

export default config;
