import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as AssetService from '../services/asset.service';
import { logEvent } from '../services/audit.service';

export const getAllAssets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, category_id, search, page, limit } = req.query as Record<string, string>;
    const result = await AssetService.getAllAssets({
      status, category_id, search,
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

export const getAssetById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await AssetService.getAssetById(req.params.id);
    res.json({ success: true, data: { asset } });
  } catch (e) { next(e); }
};

export const createAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await AssetService.createAsset(req.body, req.user!.id);
    await logEvent({ userId: req.user!.id, action: 'create_asset', entityType: 'asset', entityId: asset.id, metadata: { asset_tag: asset.asset_tag, name: asset.name }, req });
    res.status(201).json({ success: true, message: 'Asset created', data: { asset } });
  } catch (e) { next(e); }
};

export const updateAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const before = await AssetService.getAssetById(req.params.id);
    const asset  = await AssetService.updateAsset(req.params.id, req.body);
    await logEvent({ userId: req.user!.id, action: 'update_asset', entityType: 'asset', entityId: asset.id, metadata: { before, after: asset }, req });
    res.json({ success: true, message: 'Asset updated', data: { asset } });
  } catch (e) { next(e); }
};

export const updateAssetStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await AssetService.updateAssetStatus(req.params.id, req.body);
    await logEvent({ userId: req.user!.id, action: 'update_asset', entityType: 'asset', entityId: asset.id, metadata: { status: asset.status }, req });
    res.json({ success: true, message: 'Asset status updated', data: { asset } });
  } catch (e) { next(e); }
};

export const deleteAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await AssetService.deleteAsset(req.params.id);
    await logEvent({ userId: req.user!.id, action: 'delete_asset', entityType: 'asset', entityId: req.params.id, req });
    res.json({ success: true, message: 'Asset deleted' });
  } catch (e) { next(e); }
};

