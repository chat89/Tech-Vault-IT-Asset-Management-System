/**
 * middleware/webhookAuth.ts
 * Webhook signature & secret verification for external MDM telemetry feeds.
 * Prevents unauthorized submissions, validates timestamps to mitigate replay,
 * and records security rejections into audit_logs.
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../db/pool';

const WEBHOOK_SECRET = process.env.TELEMETRY_WEBHOOK_SECRET || 'techvault_telemetry_secret_key_2026';
const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 minutes

// Cache recent event nonces for replay prevention (expires in 10 minutes)
const seenEventIds = new Map<string, number>();

// Clean up stale nonces every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, timestamp] of seenEventIds.entries()) {
    if (now - timestamp > 10 * 60 * 1000) {
      seenEventIds.delete(id);
    }
  }
}, 15 * 60 * 1000).unref();

export const verifyTelemetryWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const tokenHeader = req.headers['x-telemetry-token'] as string | undefined;
  const signatureHeader = req.headers['x-telemetry-signature'] as string | undefined;
  const timestampHeader = req.headers['x-telemetry-timestamp'] as string | undefined;
  const eventIdHeader = req.headers['x-telemetry-event-id'] as string | undefined;

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';

  let authenticated = false;
  let rejectionReason = '';

  // 1. Replay prevention via Event ID / Nonce
  if (eventIdHeader) {
    if (seenEventIds.has(eventIdHeader)) {
      rejectionReason = 'Replay attack detected: duplicate x-telemetry-event-id';
    } else {
      seenEventIds.set(eventIdHeader, Date.now());
    }
  }

  // 2. Timestamp drift validation (if timestamp provided)
  if (!rejectionReason && timestampHeader) {
    const eventTime = parseInt(timestampHeader, 10);
    const now = Date.now();
    if (isNaN(eventTime) || Math.abs(now - eventTime) > MAX_TIMESTAMP_DRIFT_MS) {
      rejectionReason = `Stale request: timestamp drift exceeds ${MAX_TIMESTAMP_DRIFT_MS / 1000}s`;
    }
  }

  // 3. Authentication: Either HMAC Signature or Bearer/Shared Token
  if (!rejectionReason) {
    if (signatureHeader) {
      const payloadString = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payloadString)
        .digest('hex');

      try {
        const sigBuffer = Buffer.from(signatureHeader, 'hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');
        if (
          sigBuffer.length === expectedBuffer.length &&
          crypto.timingSafeEqual(sigBuffer, expectedBuffer)
        ) {
          authenticated = true;
        } else {
          rejectionReason = 'Invalid HMAC signature in x-telemetry-signature';
        }
      } catch {
        rejectionReason = 'Malformed HMAC signature format';
      }
    } else if (tokenHeader) {
      if (tokenHeader === WEBHOOK_SECRET) {
        authenticated = true;
      } else {
        rejectionReason = 'Invalid token in x-telemetry-token';
      }
    } else {
      rejectionReason = 'Missing x-telemetry-signature or x-telemetry-token header';
    }
  }

  if (authenticated) {
    return next();
  }

  // Log rejection to audit_logs as SECURITY_ALERT
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
       VALUES (NULL, 'update_asset', 'SECURITY_ALERT', NULL, $1, NULL)`,
      [
        JSON.stringify({
          violation: 'UNAUTHORIZED_WEBHOOK_SUBMISSION',
          endpoint: '/api/telemetry/webhook',
          ip: clientIp,
          reason: rejectionReason,
          timestamp: new Date().toISOString(),
        }),
      ]
    );
  } catch (err) {
    console.error('[WebhookAuth] Failed to log security alert:', err);
  }

  res.status(401).json({
    success: false,
    message: 'Webhook authentication failed',
    error: rejectionReason,
  });
};

