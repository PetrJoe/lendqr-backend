import express from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './modules/auth/auth.routes';
import walletRoutes from './modules/wallets/wallet.routes';
import userRoutes from './modules/users/user.routes';
import { errorMiddleware } from './middleware/error.middleware';
import swaggerSpec from './config/swagger';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/users', userRoutes);

app.use(errorMiddleware);

export default app;
