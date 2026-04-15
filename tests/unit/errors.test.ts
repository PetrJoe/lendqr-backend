import { AppError, Errors } from '../../src/shared/errors/AppError';

describe('AppError', () => {
  test('constructs with correct properties', () => {
    const err = new AppError('UNAUTHORIZED', 'Unauthorized', 401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
    expect(err.name).toBe('AppError');
  });

  test('Errors.unauthorized returns 401', () => {
    const e = Errors.unauthorized();
    expect(e.statusCode).toBe(401);
    expect(e.code).toBe('UNAUTHORIZED');
  });

  test('Errors.insufficientFunds returns 422', () => {
    const e = Errors.insufficientFunds();
    expect(e.statusCode).toBe(422);
    expect(e.code).toBe('INSUFFICIENT_FUNDS');
  });

  test('Errors.userBlacklisted returns 403', () => {
    const e = Errors.userBlacklisted();
    expect(e.code).toBe('USER_BLACKLISTED');
    expect(e.statusCode).toBe(403);
  });

  test('Errors.validation includes details', () => {
    const e = Errors.validation('bad input', { field: 'required' });
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.details).toEqual({ field: 'required' });
  });

  test('Errors.externalFailure returns 503', () => {
    const e = Errors.externalFailure('service down');
    expect(e.statusCode).toBe(503);
    expect(e.message).toBe('service down');
  });

  test('Errors.selfTransfer returns 422', () => {
    expect(Errors.selfTransfer().code).toBe('SELF_TRANSFER');
  });

  test('Errors.walletNotFound returns 404', () => {
    expect(Errors.walletNotFound().statusCode).toBe(404);
  });

  test('Errors.userNotFound returns 404', () => {
    expect(Errors.userNotFound().statusCode).toBe(404);
  });

  test('Errors.userExists returns 409', () => {
    expect(Errors.userExists().statusCode).toBe(409);
  });
});
