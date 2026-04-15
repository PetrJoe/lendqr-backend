import { Response } from 'express';
import { WalletService } from './wallet.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { txnQuerySchema } from '../../shared/utils/schemas';

export const WalletController = {
  balance: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await WalletService.getBalance(req.userId!);
    res.json({ status: 'success', data });
  }),

  fund: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await WalletService.fund(req.userId!, req.body);
    res.json({ status: 'success', message: 'Wallet funded', data });
  }),

  withdraw: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await WalletService.withdraw(req.userId!, req.body);
    res.json({ status: 'success', message: 'Withdrawal successful', data });
  }),

  transfer: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await WalletService.transfer(req.userId!, req.body);
    res.json({ status: 'success', message: 'Transfer successful', data });
  }),

  transactions: asyncHandler(async (req: AuthRequest, res: Response) => {
    const parsed = txnQuerySchema.safeParse(req.query);
    const { type, page, limit } = parsed.success ? parsed.data : { type: undefined, page: 1, limit: 20 };
    const data = await WalletService.getTransactions(req.userId!, type, page, limit);
    res.json({ status: 'success', data });
  }),
};
