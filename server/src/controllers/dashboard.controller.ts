import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDashboardStats } from '../services/dashboard.service';

export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, data: { stats } });
  } catch (e) { next(e); }
};

