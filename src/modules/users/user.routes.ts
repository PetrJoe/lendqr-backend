import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.get('/me', authMiddleware, UserController.me);
export default router;
