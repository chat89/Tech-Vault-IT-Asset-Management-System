/**
 * controllers/analytics.controller.ts
 * Analytics and Smart Procurement Forecasting endpoints.
 */
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getProcurementForecast } from '../services/analytics.service';

/**
 * GET /api/analytics/forecasting
 * Smart Procurement Forecasting: category burn rates, runways, and stockout projections.
 */
export const getForecasting = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const forecast = await getProcurementForecast();
    res.json({
      success: true,
      data: { forecast },
    });
  } catch (err) {
    next(err);
  }
};

