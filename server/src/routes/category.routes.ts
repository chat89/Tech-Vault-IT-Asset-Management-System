import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

export const categoryRouter = Router();
categoryRouter.use(authenticate);
categoryRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

