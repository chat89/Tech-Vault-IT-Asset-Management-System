import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

export const maintenanceRouter = Router();
maintenanceRouter.use(authenticate);
maintenanceRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

