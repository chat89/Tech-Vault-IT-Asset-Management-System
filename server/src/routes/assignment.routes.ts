import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/permissions.middleware';
import { assignAssetSchema, returnAssetSchema } from '../validators/assignment.validator';
import {
  getAllAssignments,
  getAssetHistory,
  getUserAssignments,
  assignAsset,
  returnAsset,
} from '../controllers/assignment.controller';

export const assignmentRouter = Router();
assignmentRouter.use(authenticate);

// List all assignments (optionally ?active=true for current only) — admin only
assignmentRouter.get(
  '/',
  authorize('super_admin', 'it_admin'),
  requirePermission('view_assets'),
  getAllAssignments
);

// Ownership history for an asset — admin only (contains historical personnel records)
assignmentRouter.get(
  '/asset/:assetId',
  authorize('super_admin', 'it_admin'),
  requirePermission('view_assets'),
  getAssetHistory
);

// Assignments for a user — scoped with IDOR check in controller (employee can only view self)
assignmentRouter.get(
  '/user/:userId',
  requirePermission('view_assets'),
  getUserAssignments
);

// Assign an asset — admin only
assignmentRouter.post(
  '/',
  authorize('super_admin', 'it_admin'),
  requirePermission('assign_asset'),
  validate(assignAssetSchema),
  assignAsset
);

// Return an asset — admin only
assignmentRouter.patch(
  '/:id/return',
  authorize('super_admin', 'it_admin'),
  requirePermission('assign_asset'),
  validate(returnAssetSchema),
  returnAsset
);
