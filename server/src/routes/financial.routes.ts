/**
 * routes/financial.routes.ts
 * Mounts financial lifecycle endpoints under /api/financial
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { financialOverview, assetFinancials } from '../controllers/financial.controller';

const router = Router();

// All financial endpoints require a valid JWT and administrative role
router.use(authenticate);
router.use(authorize('super_admin', 'it_admin'));

// GET /api/financial/overview  — summary totals for dashboard widget
router.get('/overview', financialOverview);

// GET /api/financial/assets    — per-asset depreciation breakdown
router.get('/assets', assetFinancials);

export default router;
