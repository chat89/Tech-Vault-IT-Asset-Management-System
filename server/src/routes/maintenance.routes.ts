import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/permissions.middleware';
import { createMaintenanceSchema, updateMaintenanceSchema } from '../validators/maintenance.validator';
import {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenance.controller';

export const maintenanceRouter = Router();
maintenanceRouter.use(authenticate);

// Maintenance logs are restricted to IT staff & Super Admins
maintenanceRouter.get(
  '/',
  authorize('super_admin', 'it_admin'),
  requirePermission('manage_maintenance'),
  getAllMaintenance
);

maintenanceRouter.get(
  '/:id',
  authorize('super_admin', 'it_admin'),
  requirePermission('manage_maintenance'),
  getMaintenanceById
);

maintenanceRouter.post(
  '/',
  authorize('super_admin', 'it_admin'),
  requirePermission('manage_maintenance'),
  validate(createMaintenanceSchema),
  createMaintenance
);

maintenanceRouter.patch(
  '/:id',
  authorize('super_admin', 'it_admin'),
  requirePermission('manage_maintenance'),
  validate(updateMaintenanceSchema),
  updateMaintenance
);

maintenanceRouter.delete(
  '/:id',
  authorize('super_admin'),
  requirePermission('manage_maintenance'),
  deleteMaintenance
);
