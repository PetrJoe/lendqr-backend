import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

type AsyncHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

/** Wraps an async route handler and forwards errors to Express error middleware. */
export const asyncHandler =
  (fn: AsyncHandler) => (req: AuthRequest, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
