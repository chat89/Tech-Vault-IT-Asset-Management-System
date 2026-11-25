import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permissions.middleware';
import { getAuditLogs } from '../controllers/audit.controller';

export const auditRouter = Router();
auditRouter.use(authenticate);
auditRouter.get('/', authorize('super_admin','it_admin'), requirePermission('view_reports'), getAuditLogs);
