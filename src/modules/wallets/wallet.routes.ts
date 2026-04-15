import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { walletOpSchema, transferSchema } from '../../shared/utils/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/balance', WalletController.balance);
router.get('/transactions', WalletController.transactions);
router.post('/fund', validate(walletOpSchema), WalletController.fund);
router.post('/withdraw', validate(walletOpSchema), WalletController.withdraw);
router.post('/transfer', validate(transferSchema), WalletController.transfer);

export default router;
