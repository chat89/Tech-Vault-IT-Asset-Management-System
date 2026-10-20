import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

export const assetRouter = Router();
assetRouter.use(authenticate);
assetRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

