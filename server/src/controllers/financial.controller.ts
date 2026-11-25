/**
 * controllers/financial.controller.ts
 * Endpoints for the Financial Lifecycle & Depreciation engine.
 */
import { Request, Response, NextFunction } from 'express';
import { getFinancialOverview, getAssetFinancials } from '../services/financial.service';

export const financialOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const overview = await getFinancialOverview();
    res.json({ success: true, data: { overview } });
  } catch (err) {
    next(err);
  }
};

export const assetFinancials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assets = await getAssetFinancials();
    res.json({ success: true, data: { assets } });
  } catch (err) {
    next(err);
  }
};

