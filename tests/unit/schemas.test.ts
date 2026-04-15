import { registerSchema, loginSchema, walletOpSchema, transferSchema, txnQuerySchema } from '../../src/shared/utils/schemas';

describe('Zod schemas', () => {
  describe('registerSchema', () => {
    test('accepts valid input', () => {
      const r = registerSchema.safeParse({ first_name: 'Alice', last_name: 'Test', email: 'a@b.com', password: 'Password1' });
      expect(r.success).toBe(true);
    });
    test('rejects missing email', () => {
      const r = registerSchema.safeParse({ first_name: 'A', last_name: 'B', password: 'pass1234' });
      expect(r.success).toBe(false);
    });
    test('rejects short password', () => {
      const r = registerSchema.safeParse({ first_name: 'A', last_name: 'B', email: 'a@b.com', password: 'short' });
      expect(r.success).toBe(false);
    });
  });

  describe('walletOpSchema', () => {
    test('accepts positive amount', () => {
      expect(walletOpSchema.safeParse({ amount: 100 }).success).toBe(true);
    });
    test('rejects zero amount', () => {
      expect(walletOpSchema.safeParse({ amount: 0 }).success).toBe(false);
    });
    test('rejects negative amount', () => {
      expect(walletOpSchema.safeParse({ amount: -50 }).success).toBe(false);
    });
  });

  describe('transferSchema', () => {
    test('accepts valid transfer', () => {
      const r = transferSchema.safeParse({ amount: 100, receiver_email: 'bob@test.com' });
      expect(r.success).toBe(true);
    });
    test('rejects invalid receiver email', () => {
      const r = transferSchema.safeParse({ amount: 100, receiver_email: 'not-an-email' });
      expect(r.success).toBe(false);
    });
  });

  describe('txnQuerySchema', () => {
    test('defaults page=1 limit=20', () => {
      const r = txnQuerySchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBe(1);
        expect(r.data.limit).toBe(20);
      }
    });
    test('accepts valid type filter', () => {
      const r = txnQuerySchema.safeParse({ type: 'FUND' });
      expect(r.success).toBe(true);
    });
    test('rejects invalid type', () => {
      const r = txnQuerySchema.safeParse({ type: 'INVALID' });
      expect(r.success).toBe(false);
    });
  });
});
