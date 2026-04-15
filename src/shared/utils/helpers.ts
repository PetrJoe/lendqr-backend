import crypto from 'crypto';

export const generateId = () => crypto.randomUUID();

export const generateReference = (prefix = 'TXN') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const toMinorUnit = (amount: number) => Math.round(amount * 100);
export const fromMinorUnit = (minor: number) => minor / 100;

export const hashRequest = (payload: unknown) =>
  crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
