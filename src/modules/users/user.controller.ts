import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { UserRepository } from './user.repository';
import { WalletRepository } from '../wallets/wallet.repository';
import { Errors } from '../../shared/errors/AppError';
import { fromMinorUnit } from '../../shared/utils/helpers';

export const UserController = {
  me: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserRepository.findById(req.userId!);
    if (!user) throw Errors.userNotFound();
    const wallet = await WalletRepository.findByUserId(req.userId!);
    res.json({
      status: 'success',
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        wallet: wallet ? { balance: fromMinorUnit(wallet.balance_minor), currency: wallet.currency } : null,
      },
    });
  }),
};
