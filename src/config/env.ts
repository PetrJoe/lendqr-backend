import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'lendqr_wallet',
  },
  adjutor: {
    baseUrl: process.env.ADJUTOR_BASE_URL || 'https://adjutor.lendsqr.com/v2',
    apiKey: process.env.ADJUTOR_API_KEY || '',
    timeoutMs: parseInt(process.env.ADJUTOR_TIMEOUT_MS || '5000', 10),
  },
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
};
