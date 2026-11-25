import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as MaintenanceService from '../services/maintenance.service';
import { logEvent } from '../services/audit.service';

export const getAllMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assetId = req.query.asset_id as string | undefined;
    const records = await MaintenanceService.getAllMaintenanceRecords(assetId);
    res.json({ success: true, data: { records } });
  } catch (e) { next(e); }
};

export const getMaintenanceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const record = await MaintenanceService.getMaintenanceById(req.params.id);
    res.json({ success: true, data: { record } });
  } catch (e) { next(e); }
};

export const createMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const record = await MaintenanceService.createMaintenance(req.body, req.user!.id);
    await logEvent({ userId: req.user!.id, action: 'create_maintenance', entityType: 'maintenance', entityId: (record as { id: string }).id, metadata: { asset_id: req.body.asset_id }, req });
    res.status(201).json({ success: true, message: 'Maintenance record created', data: { record } });
  } catch (e) { next(e); }
};

export const updateMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const record = await MaintenanceService.updateMaintenance(req.params.id, req.body);
    await logEvent({ userId: req.user!.id, action: 'update_maintenance', entityType: 'maintenance', entityId: req.params.id, req });
    res.json({ success: true, message: 'Maintenance record updated', data: { record } });
  } catch (e) { next(e); }
};

export const deleteMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await MaintenanceService.deleteMaintenance(req.params.id);
    res.json({ success: true, message: 'Maintenance record deleted' });
  } catch (e) { next(e); }
};

