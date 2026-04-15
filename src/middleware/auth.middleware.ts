import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/auth.service';
import { UserRepository } from '../modules/users/user.repository';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Missing token' });
      return;
    }
    const token = header.slice(7);
    const userId = verifyToken(token);
    const user = await UserRepository.findById(userId);
    if (!user) {
      res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Invalid token' });
      return;
    }
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Unauthorized' });
  }
}
