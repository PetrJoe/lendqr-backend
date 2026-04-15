import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../middleware/async.middleware';

export const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({ status: 'success', message: 'Account created', data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.json({ status: 'success', message: 'Login successful', data: result });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body.email);
    res.json({ status: 'success', data: result });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body.token, req.body.password);
    res.json({ status: 'success', data: result });
  }),
};
