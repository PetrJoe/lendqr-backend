import { AuthService } from '../../src/modules/auth/auth.service';
import { UserRepository } from '../../src/modules/users/user.repository';
import { WalletRepository } from '../../src/modules/wallets/wallet.repository';
import * as adjutor from '../../src/integrations/adjutor/adjutor.client';
import { db } from '../../src/config/db';

jest.mock('../../src/modules/users/user.repository');
jest.mock('../../src/modules/wallets/wallet.repository');
jest.mock('../../src/integrations/adjutor/adjutor.client');
jest.mock('../../src/config/db', () => {
  const insertMock = jest.fn().mockResolvedValue([1]);
  const callMock = jest.fn().mockReturnValue({ insert: insertMock });
  return {
    db: Object.assign(callMock, {
      transaction: jest.fn(),
      fn: { now: jest.fn() },
      _insertMock: insertMock,
    }),
  };
});

const mockUser = {
  id: 'user-1',
  first_name: 'Alice',
  last_name: 'Test',
  email: 'alice@test.com',
  phone: null,
  password_hash: '$2a$10$hashedpassword',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('AuthService.register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-setup the db mock after clearAllMocks
    const insertMock = jest.fn().mockResolvedValue([1]);
    (db as unknown as jest.Mock).mockReturnValue({ insert: insertMock });
    (db.transaction as jest.Mock).mockImplementation(async (cb: (trx: unknown) => Promise<unknown>) => cb({}));
  });

  test('registers user when not blacklisted', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (adjutor.checkKarmaBlacklist as jest.Mock).mockResolvedValue({ isBlacklisted: false, raw: {} });
    (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);
    (WalletRepository.create as jest.Mock).mockResolvedValue({});

    const result = await AuthService.register({
      first_name: 'Alice',
      last_name: 'Test',
      email: 'alice@test.com',
      password: 'Password123!',
    });

    expect(result.user.email).toBe('alice@test.com');
    expect(result.token).toBeDefined();
  });

  test('throws USER_ALREADY_EXISTS when email taken', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      AuthService.register({ first_name: 'A', last_name: 'B', email: 'alice@test.com', password: 'pass1234' }),
    ).rejects.toMatchObject({ code: 'USER_ALREADY_EXISTS' });
  });

  test('throws USER_BLACKLISTED when karma returns blacklisted', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (adjutor.checkKarmaBlacklist as jest.Mock).mockResolvedValue({ isBlacklisted: true, raw: {} });

    await expect(
      AuthService.register({ first_name: 'A', last_name: 'B', email: 'bad@test.com', password: 'pass1234' }),
    ).rejects.toMatchObject({ code: 'USER_BLACKLISTED' });
  });

  test('throws EXTERNAL_SERVICE_FAILURE when adjutor fails', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (adjutor.checkKarmaBlacklist as jest.Mock).mockRejectedValue(
      Object.assign(new Error('fail'), { code: 'EXTERNAL_SERVICE_FAILURE' }),
    );

    await expect(
      AuthService.register({ first_name: 'A', last_name: 'B', email: 'x@test.com', password: 'pass1234' }),
    ).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE_FAILURE' });
  });
});
