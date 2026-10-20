/**
 * services/audit.service.ts
 * Centralised audit logging — called from controllers on every write operation.
 */

import { query } from '../db/pool';
import { AuditAction } from '../types/db.types';
import { Request } from 'express';

interface LogEventOptions {
  userId: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  req?: Request;
}

export const logEvent = async (opts: LogEventOptions): Promise<void> => {
  const { userId, action, entityType, entityId, metadata, req } = opts;

  const ipAddress = req
    ? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
      req.socket.remoteAddress ??
      null
    : null;

  const userAgent = req ? (req.headers['user-agent'] ?? null) : null;

  try {
    await query(
      `INSERT INTO audit_logs
         (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6::inet, $7)`,
      [
        userId,
        action,
        entityType ?? null,
        entityId ?? null,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
      ]
    );
  } catch (err) {
    // Audit failures must never break the main request
    console.error('[AuditService] Failed to write audit log:', err);
  }
};

