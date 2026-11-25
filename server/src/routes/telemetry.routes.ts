/**
 * routes/telemetry.routes.ts
 * MDM Telemetry routes — /api/telemetry
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { verifyTelemetryWebhook } from '../middleware/webhookAuth';
import { telemetryWebhookSchema } from '../validators/telemetry.validator';
import {
  listTelemetry,
  assetTelemetryHistory,
  telemetryWebhook,
} from '../controllers/telemetry.controller';

const router = Router();

// Webhook: authenticated via HMAC signature or shared secret header + schema validation
router.post(
  '/webhook',
  verifyTelemetryWebhook,
  validate(telemetryWebhookSchema),
  telemetryWebhook
);

// Authenticated telemetry reads — restricted to IT Admin and Super Admin
router.use(authenticate);
router.use(authorize('super_admin', 'it_admin'));

router.get('/', listTelemetry);
router.get('/:assetId', assetTelemetryHistory);

export default router;
