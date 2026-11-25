import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as RequestService from '../services/request.service';
import { logEvent } from '../services/audit.service';

export const getRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isEmployee = req.user?.role === 'employee';
    // Employees can only inspect their own requests; Admins can see all or filter by user_id
    const user_id = isEmployee ? req.user!.id : (req.query.user_id as string | undefined);
    const status = req.query.status as string | undefined;

    const requests = await RequestService.getAssetRequests({ user_id, status });
    res.json({ success: true, data: { requests } });
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const request = await RequestService.getAssetRequestById(req.params.id);
    if (req.user?.role === 'employee' && (request as { user_id: string }).user_id !== req.user.id) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only view your own requests' });
      return;
    }
    res.json({ success: true, data: { request } });
  } catch (err) {
    next(err);
  }
};

export const createRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const request = await RequestService.createAssetRequest(req.user!.id, req.body);
    await logEvent({
      userId: req.user!.id,
      action: 'create_asset', // Audit log action
      entityType: 'asset_request',
      entityId: (request as { id: string }).id,
      metadata: { priority: req.body.priority, asset_type: req.body.asset_type },
      req,
    });
    res.status(201).json({ success: true, message: 'Asset request submitted successfully', data: { request } });
  } catch (err) {
    next(err);
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const request = await RequestService.updateAssetRequestStatus(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body
    );
    await logEvent({
      userId: req.user!.id,
      action: 'update_asset',
      entityType: 'asset_request',
      entityId: req.params.id,
      metadata: { status: req.body.status, admin_notes: req.body.admin_notes },
      req,
    });
    res.json({ success: true, message: `Request ${req.body.status}`, data: { request } });
  } catch (err) {
    next(err);
  }
};
