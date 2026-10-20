import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get('/stats', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

