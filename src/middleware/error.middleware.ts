import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      details: err.details || {},
    });
  }

  // Knex duplicate entry
  if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ status: 'error', code: 'USER_ALREADY_EXISTS', message: 'Duplicate entry' });
  }

  console.error('[UnhandledError]', err);
  return res.status(500).json({ status: 'error', code: 'INTERNAL_ERROR', message: 'Internal server error' });
}
