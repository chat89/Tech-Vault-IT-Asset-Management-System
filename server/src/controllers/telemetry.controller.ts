/**
 * controllers/telemetry.controller.ts
 * MDM Telemetry endpoints.
 */
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getLatestTelemetry,
  getAssetTelemetry,
  receiveTelemetryWebhook,
} from '../services/telemetry.service';
import { TelemetryWebhookInput } from '../validators/telemetry.validator';

/** GET /api/telemetry — latest health scores for all assets */
export const listTelemetry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const telemetry = await getLatestTelemetry();
    res.json({ success: true, data: { telemetry } });
  } catch (err) {
    next(err);
  }
};

/** GET /api/telemetry/:assetId — telemetry history for one asset */
export const assetTelemetryHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const telemetry = await getAssetTelemetry(req.params.assetId);
    res.json({ success: true, data: { telemetry } });
  } catch (err) {
    next(err);
  }
};

/** POST /api/telemetry/webhook — receive authenticated telemetry from MDM system */
export const telemetryWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { asset_id, ...payload } = req.body as TelemetryWebhookInput;
    await receiveTelemetryWebhook(asset_id, payload);
    res.json({ success: true, message: 'Telemetry processed successfully' });
  } catch (err) {
    next(err);
  }
};
