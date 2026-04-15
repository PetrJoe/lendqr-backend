export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'USER_ALREADY_EXISTS'
  | 'USER_BLACKLISTED'
  | 'USER_NOT_FOUND'
  | 'WALLET_NOT_FOUND'
  | 'INSUFFICIENT_FUNDS'
  | 'SELF_TRANSFER'
  | 'IDEMPOTENCY_CONFLICT'
  | 'EXTERNAL_SERVICE_FAILURE';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Unauthorized', 401),
  userExists: () => new AppError('USER_ALREADY_EXISTS', 'Email or phone already registered', 409),
  userBlacklisted: () => new AppError('USER_BLACKLISTED', 'User is on the karma blacklist', 403),
  userNotFound: () => new AppError('USER_NOT_FOUND', 'User not found', 404),
  walletNotFound: () => new AppError('WALLET_NOT_FOUND', 'Wallet not found', 404),
  insufficientFunds: () => new AppError('INSUFFICIENT_FUNDS', 'Insufficient wallet balance', 422),
  selfTransfer: () => new AppError('SELF_TRANSFER', 'Cannot transfer to your own wallet', 422),
  externalFailure: (msg: string) => new AppError('EXTERNAL_SERVICE_FAILURE', msg, 503),
  idempotencyConflict: () => new AppError('IDEMPOTENCY_CONFLICT', 'Duplicate request with different payload', 409),
  validation: (msg: string, details?: unknown) => new AppError('VALIDATION_ERROR', msg, 400, details),
};
