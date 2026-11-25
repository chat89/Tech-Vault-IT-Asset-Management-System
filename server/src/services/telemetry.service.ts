/**
 * services/telemetry.service.ts
 * Simulated MDM Telemetry Engine.
 * - Provides GET endpoint data (latest per asset)
 * - Runs a background simulation every 3 minutes
 * - Auto-creates maintenance records if health < 40%
 */
import { query } from '../db/pool';
import { TelemetryRow } from '../types/db.types';

// ── Latest telemetry per asset ───────────────────────────────
export const getLatestTelemetry = async (): Promise<TelemetryRow[]> => {
  const { rows } = await query<TelemetryRow>(`
    SELECT DISTINCT ON (t.asset_id)
      t.*
    FROM asset_telemetry t
    ORDER BY t.asset_id, t.last_ping DESC
  `);
  return rows;
};

// ── Telemetry for a single asset ─────────────────────────────
export const getAssetTelemetry = async (assetId: string): Promise<TelemetryRow[]> => {
  const { rows } = await query<TelemetryRow>(`
    SELECT * FROM asset_telemetry
    WHERE asset_id = $1
    ORDER BY last_ping DESC
    LIMIT 20
  `, [assetId]);
  return rows;
};

// ── Webhook: receive telemetry from external MDM ─────────────
export const receiveTelemetryWebhook = async (
  assetId: string,
  payload: {
    health_score: number;
    battery_level?: number | null;
    disk_status?: 'healthy' | 'warning' | 'critical';
    cpu_temp_c?: number;
  }
) => {
  // Validate asset exists
  const assetCheck = await query<{ id: string; status: string }>(
    `SELECT id, status FROM assets WHERE id = $1`,
    [assetId]
  );
  if (!assetCheck.rows.length) {
    throw new Error(`Asset with ID ${assetId} not found in registry`);
  }

  const health_score  = Math.max(0, Math.min(100, Math.round(payload.health_score)));
  const battery_level = payload.battery_level != null
    ? Math.max(0, Math.min(100, Math.round(payload.battery_level)))
    : null;
  const disk_status   = payload.disk_status ?? 'healthy';
  const cpu_temp_c    = payload.cpu_temp_c ?? 45;

  // Insert telemetry record
  await query(
    `INSERT INTO asset_telemetry (asset_id, health_score, battery_level, disk_status, cpu_temp_c, last_ping)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [assetId, health_score, battery_level, disk_status, cpu_temp_c]
  );

  // Auto-maintenance trigger: health < 40 → flag asset & create maintenance record
  if (health_score < 40) {
    await handleLowHealthAsset(assetId, health_score);
  }
};

// ── Auto-maintenance on low health ───────────────────────────
const handleLowHealthAsset = async (assetId: string, healthScore: number): Promise<void> => {
  // Get asset details
  const assetResult = await query<{ status: string; name: string }>(
    `SELECT status, name FROM assets WHERE id = $1`, [assetId]
  );
  if (!assetResult.rows.length) return;
  const asset = assetResult.rows[0];

  // Only trigger if not already under maintenance or retired
  if (asset.status === 'under_maintenance' || asset.status === 'retired') return;

  // Update asset status to under_maintenance
  await query(
    `UPDATE assets SET status = 'under_maintenance' WHERE id = $1`,
    [assetId]
  );

  // Check if an auto-flagged maintenance record already exists for this asset (within last 24h)
  const existingMaint = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM maintenance_records
     WHERE asset_id = $1
       AND notes ILIKE '%auto-flagged%'
       AND created_at >= NOW() - INTERVAL '24 hours'`,
    [assetId]
  );
  if (parseInt(existingMaint.rows[0]?.count ?? '0', 10) > 0) return;

  // Create a maintenance record automatically
  await query(
    `INSERT INTO maintenance_records
       (asset_id, maintenance_type, status, description, scheduled_date, notes)
     VALUES ($1, 'corrective', 'scheduled', $2, NOW(), $3)`,
    [
      assetId,
      `[System Auto-Flagged] Critical health alert detected — Health Score: ${healthScore}%. Asset has been automatically queued for maintenance review.`,
      `auto-flagged by MDM telemetry simulator — health_score=${healthScore}%`,
    ]
  );
};

// ── Background MDM Simulator ─────────────────────────────────
let simulatorTimer: ReturnType<typeof setInterval> | null = null;

const DRIFT_RANGE = 8; // health score can drift ±8 per tick

export const startTelemetrySimulator = async (): Promise<void> => {
  if (simulatorTimer) return; // already running

  console.log('🤖 [Telemetry Simulator] Starting — polling every 3 minutes');

  const tick = async () => {
    try {
      // Get all asset IDs
      const { rows: assets } = await query<{ id: string; name: string; status: string }>(
        `SELECT id, name, status FROM assets WHERE status != 'disposed' AND status != 'retired'`
      );
      if (!assets.length) return;

      // Get current health scores (latest per asset)
      const { rows: latest } = await query<{ asset_id: string; health_score: number; battery_level: number | null }>(
        `SELECT DISTINCT ON (asset_id) asset_id, health_score, battery_level
         FROM asset_telemetry
         ORDER BY asset_id, last_ping DESC`
      );

      const healthMap = new Map(latest.map((r) => [r.asset_id, { health: r.health_score, battery: r.battery_level }]));

      for (const asset of assets) {
        const current = healthMap.get(asset.id) ?? { health: 85, battery: null };

        // Drift health ±DRIFT_RANGE, clamp to [5, 100]
        const drift  = (Math.random() * DRIFT_RANGE * 2) - DRIFT_RANGE;
        const newHealth = Math.max(5, Math.min(100, Math.round(current.health + drift)));

        // Drift battery if applicable (laptops/mobiles)
        let newBattery: number | null = null;
        if (current.battery != null) {
          const battDrift = (Math.random() * 4) - 2; // ±2%
          newBattery = Math.max(5, Math.min(100, Math.round(current.battery + battDrift)));
        }

        const diskStatus = newHealth < 30 ? 'critical' : newHealth < 55 ? 'warning' : 'healthy';
        const cpuTemp    = Math.floor(Math.random() * 40 + 35); // 35–75°C

        await receiveTelemetryWebhook(asset.id, {
          health_score:  newHealth,
          battery_level: newBattery,
          disk_status:   diskStatus as 'healthy' | 'warning' | 'critical',
          cpu_temp_c:    cpuTemp,
        });
      }

      console.log(`🤖 [Telemetry Simulator] Tick complete — updated ${assets.length} assets`);
    } catch (err) {
      console.error('[Telemetry Simulator] Error during tick:', err);
    }
  };

  // Run immediately on start, then every 3 minutes
  await tick();
  simulatorTimer = setInterval(tick, 3 * 60 * 1000);
};

export const stopTelemetrySimulator = (): void => {
  if (simulatorTimer) {
    clearInterval(simulatorTimer);
    simulatorTimer = null;
    console.log('🤖 [Telemetry Simulator] Stopped');
  }
};

