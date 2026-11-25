import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as AssignmentService from '../services/assignment.service';
import { logEvent } from '../services/audit.service';

export const getAllAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activeOnly = req.query.active === 'true';
    const assignments = await AssignmentService.getAllAssignments(activeOnly);
    res.json({ success: true, data: { assignments } });
  } catch (e) { next(e); }
};

export const getAssetHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = await AssignmentService.getAssetHistory(req.params.assetId);
    res.json({ success: true, data: { history } });
  } catch (e) { next(e); }
};

export const getUserAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // IDOR Protection: Employees can only view their own assignment records
    if (req.user?.role === 'employee' && req.params.userId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only inspect your own equipment assignments' });
      return;
    }
    const assignments = await AssignmentService.getUserAssignments(req.params.userId);
    res.json({ success: true, data: { assignments } });
  } catch (e) { next(e); }
};

export const assignAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await AssignmentService.assignAsset(req.body, req.user!.id);
    await logEvent({ userId: req.user!.id, action: 'assign_asset', entityType: 'assignment', entityId: assignment.id, metadata: { asset_id: req.body.asset_id, assigned_to: req.body.assigned_to }, req });
    res.status(201).json({ success: true, message: 'Asset assigned', data: { assignment } });
  } catch (e) { next(e); }
};

export const returnAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await AssignmentService.returnAsset(req.params.id, req.body);
    await logEvent({ userId: req.user!.id, action: 'return_asset', entityType: 'assignment', entityId: req.params.id, req });
    res.json({ success: true, message: 'Asset returned successfully' });
  } catch (e) { next(e); }
};

