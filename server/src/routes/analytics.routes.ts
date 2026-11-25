/**
 * routes/analytics.routes.ts
 * Analytics and Forecasting routes — /api/analytics
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getForecasting } from '../controllers/analytics.controller';

const router = Router();

// Forecasting requires authentication and administrative role
router.use(authenticate);
router.use(authorize('super_admin', 'it_admin'));

// GET /api/analytics/forecasting
router.get('/forecasting', getForecasting);

export default router;
