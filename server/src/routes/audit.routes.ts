import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

export const auditRouter = Router();
auditRouter.use(authenticate);
auditRouter.get('/', authorize('super_admin', 'it_admin'), (_req, res) =>
  res.status(501).json({ message: 'Not implemented yet' })
);

