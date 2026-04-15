import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../../config/db';
import { UserRepository } from '../users/user.repository';
import { WalletRepository } from '../wallets/wallet.repository';
import { checkKarmaBlacklist } from '../../integrations/adjutor/adjutor.client';
import { Errors } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/helpers';
import { env } from '../../config/env';

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Faux token: base64(userId.timestamp.hmac)
const signToken = (userId: string): string => {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac('sha256', env.jwtSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64');
};

export const verifyToken = (token: string): string => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split('.');
    if (parts.length !== 3) throw new Error();
    const [userId, ts, sig] = parts;
    const expected = crypto.createHmac('sha256', env.jwtSecret).update(`${userId}.${ts}`).digest('hex');
    if (sig !== expected) throw new Error();
    return userId;
  } catch {
    throw Errors.unauthorized();
  }
};

export const AuthService = {
  register: async (input: RegisterInput) => {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) throw Errors.userExists();

    // Karma blacklist check
    const karma = await checkKarmaBlacklist(input.email);
    // Persist audit record
    await db('blacklist_checks').insert({
      id: generateId(),
      user_email: input.email,
      user_phone: input.phone || null,
      provider: 'ADJUTOR_KARMA',
      is_blacklisted: karma.isBlacklisted,
      provider_response_json: JSON.stringify(karma.raw),
    });

    if (karma.isBlacklisted) throw Errors.userBlacklisted();

    const password_hash = await bcrypt.hash(input.password, 10);

    const user = await db.transaction(async (trx) => {
      const newUser = await UserRepository.create({
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        phone: input.phone || null,
        password_hash,
      });
      await WalletRepository.create(newUser.id, trx);
      return newUser;
    });

    const token = signToken(user.id);
    return { user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }, token };
  },

  login: async (input: LoginInput) => {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) throw Errors.unauthorized();
    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) throw Errors.unauthorized();
    const token = signToken(user.id);
    return { user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }, token };
  },
};
