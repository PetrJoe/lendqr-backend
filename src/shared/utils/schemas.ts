import { z } from 'zod';

export const registerSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(20).optional(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const walletOpSchema = z.object({
  amount: z.number().positive(),
  reference: z.string().trim().max(100).optional(),
});

export const transferSchema = walletOpSchema.extend({
  receiver_email: z.string().trim().email(),
});

export const txnQuerySchema = z.object({
  type: z.enum(['FUND', 'TRANSFER_DEBIT', 'TRANSFER_CREDIT', 'WITHDRAW']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
