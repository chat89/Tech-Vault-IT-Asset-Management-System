import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/permissions.middleware';
import { createAssetSchema, updateAssetSchema, updateAssetStatusSchema } from '../validators/asset.validator';
import { getAllAssets, getAssetById, createAsset, updateAsset, updateAssetStatus, deleteAsset } from '../controllers/asset.controller';

export const assetRouter = Router();
assetRouter.use(authenticate);

assetRouter.get('/',                   requirePermission('view_assets'), getAllAssets);
assetRouter.get('/:id',               requirePermission('view_assets'), getAssetById);
assetRouter.post('/',                  authorize('super_admin','it_admin'), requirePermission('create_asset'), validate(createAssetSchema), createAsset);
assetRouter.patch('/:id',             authorize('super_admin','it_admin'), requirePermission('update_asset'), validate(updateAssetSchema), updateAsset);
assetRouter.patch('/:id/status',      authorize('super_admin','it_admin'), requirePermission('update_asset'), validate(updateAssetStatusSchema), updateAssetStatus);
assetRouter.delete('/:id',            authorize('super_admin','it_admin'), requirePermission('delete_asset'), deleteAsset);
