import { db } from '../../config/db';
import { generateId } from '../../shared/utils/helpers';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export const UserRepository = {
  findByEmail: (email: string) => db<User>('users').where({ email }).first(),

  findById: (id: string) => db<User>('users').where({ id }).first(),

  create: async (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    const id = generateId();
    await db('users').insert({ id, ...data });
    return db<User>('users').where({ id }).first() as Promise<User>;
  },
};
