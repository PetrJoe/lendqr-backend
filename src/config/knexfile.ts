import type { Knex } from 'knex';
import { env } from './env';

const config: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
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
