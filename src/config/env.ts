import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    url: process.env.DATABASE_URL || 'postgres://postgres:password@127.0.0.1:5432/lendqr_wallet',
    ssl: process.env.DB_SSL === 'true' || /sslmode=require/i.test(process.env.DATABASE_URL || ''),
  },
  adjutor: {
    baseUrl: process.env.ADJUTOR_BASE_URL || 'https://adjutor.lendsqr.com/v2',
    apiKey: process.env.ADJUTOR_API_KEY || '',
    timeoutMs: parseInt(process.env.ADJUTOR_TIMEOUT_MS || '5000', 10),
  },
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
};
