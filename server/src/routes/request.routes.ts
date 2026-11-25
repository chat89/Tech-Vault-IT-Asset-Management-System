import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createAssetRequestSchema, updateAssetRequestStatusSchema } from '../validators/request.validator';
import { getRequests, getRequestById, createRequest, updateRequestStatus } from '../controllers/request.controller';

export const requestRouter = Router();
requestRouter.use(authenticate);

// View requests: Employees see their own, Admins see all
requestRouter.get('/', getRequests);
requestRouter.get('/:id', getRequestById);

// Submit a new asset request: Any authenticated employee or admin
requestRouter.post('/', validate(createAssetRequestSchema), createRequest);

// Review & transition request status: IT Admin & Super Admin only
requestRouter.patch(
  '/:id/status',
  authorize('super_admin', 'it_admin'),
  validate(updateAssetRequestStatusSchema),
  updateRequestStatus
);

