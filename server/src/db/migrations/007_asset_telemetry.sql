-- ============================================================
-- Migration: 007_asset_telemetry.sql
-- Creates asset_telemetry table for MDM-simulated health data.
-- ============================================================

-- 1. Create the telemetry table
CREATE TABLE IF NOT EXISTS asset_telemetry (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id        UUID         NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  health_score    INTEGER      NOT NULL CHECK (health_score BETWEEN 0 AND 100),
  battery_level   INTEGER      CHECK (battery_level BETWEEN 0 AND 100),
  disk_status     VARCHAR(20)  DEFAULT 'healthy'  CHECK (disk_status IN ('healthy','warning','critical')),
  cpu_temp_c      INTEGER      DEFAULT 0,
  last_ping       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_asset_id ON asset_telemetry(asset_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_last_ping ON asset_telemetry(last_ping);

-- 2. Seed initial healthy telemetry for the 25 existing assets
INSERT INTO asset_telemetry (asset_id, health_score, battery_level, disk_status, cpu_temp_c, last_ping)
SELECT
  id,
  -- Random starting health score: most healthy, few degraded
  CASE
    WHEN status = 'under_maintenance' THEN FLOOR(RANDOM() * 30 + 5)::INT
    WHEN status = 'retired'           THEN FLOOR(RANDOM() * 20 + 5)::INT
    ELSE                                   FLOOR(RANDOM() * 35 + 60)::INT  -- 60-95
  END AS health_score,
  CASE
    WHEN name ILIKE '%macbook%' OR name ILIKE '%iphone%' OR name ILIKE '%thinkpad%'
    THEN FLOOR(RANDOM() * 40 + 55)::INT   -- laptops/mobile: 55-95%
    ELSE NULL                              -- desktops/servers: no battery
  END AS battery_level,
  CASE
    WHEN status = 'under_maintenance' THEN 'warning'
    WHEN status = 'retired'           THEN 'critical'
    ELSE 'healthy'
  END AS disk_status,
  FLOOR(RANDOM() * 30 + 40)::INT AS cpu_temp_c,
  NOW() - (RANDOM() * INTERVAL '30 minutes') AS last_ping
FROM assets
ON CONFLICT DO NOTHING;

