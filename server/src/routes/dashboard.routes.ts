import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permissions.middleware';
import { getStats } from '../controllers/dashboard.controller';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get('/stats', authorize('super_admin','it_admin'), requirePermission('view_reports'), getStats);
