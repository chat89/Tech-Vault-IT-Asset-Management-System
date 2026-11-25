-- ============================================================
-- Migration: 006_financial_lifecycle.sql
-- Adds Financial Lifecycle & Depreciation Engine columns
-- to the assets table. Idempotent via ALTER IF NOT EXISTS.
-- ============================================================

-- 1. Create depreciation model enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'depreciation_model') THEN
    CREATE TYPE depreciation_model AS ENUM ('STRAIGHT_LINE', 'DOUBLE_DECLINING');
  END IF;
END;
$$;

-- 2. Add new financial columns to assets
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS salvage_value     NUMERIC(12,2)       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS useful_life_years INTEGER             DEFAULT 3,
  ADD COLUMN IF NOT EXISTS depreciation_mdl  depreciation_model  DEFAULT 'STRAIGHT_LINE';

-- 3. Backfill salvage_value and useful_life_years for existing assets
--    Use realistic estimates: salvage = 10% of purchase_cost, life = 3-5 yrs
UPDATE assets SET
  salvage_value     = ROUND(COALESCE(purchase_cost, 0) * 0.10, 2),
  useful_life_years = CASE
    WHEN name ILIKE '%server%'  THEN 5
    WHEN name ILIKE '%mac%'     THEN 4
    WHEN name ILIKE '%switch%'  THEN 5
    WHEN name ILIKE '%firewall%' THEN 5
    ELSE 3
  END,
  depreciation_mdl  = 'STRAIGHT_LINE'
WHERE salvage_value = 0 OR salvage_value IS NULL;

-- 4. Create a computed-view for real-time book values
CREATE OR REPLACE VIEW asset_financials AS
SELECT
  a.id,
  a.asset_tag,
  a.name,
  a.category_id,
  a.purchase_cost,
  a.purchase_date,
  a.salvage_value,
  a.useful_life_years,
  a.depreciation_mdl,
  a.status,
  -- Age in years (fractional)
  EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / 86400 / 365.25 AS age_years,
  -- Straight-line annual depreciation
  CASE
    WHEN a.useful_life_years > 0 AND a.purchase_cost IS NOT NULL AND a.purchase_date IS NOT NULL
    THEN (a.purchase_cost - COALESCE(a.salvage_value, 0)) / a.useful_life_years
    ELSE 0
  END AS annual_depreciation,
  -- Current Book Value (Straight-Line)
  CASE
    WHEN a.depreciation_mdl = 'STRAIGHT_LINE' AND a.purchase_cost IS NOT NULL AND a.purchase_date IS NOT NULL
    THEN GREATEST(
      COALESCE(a.salvage_value, 0),
      a.purchase_cost - (
        (a.purchase_cost - COALESCE(a.salvage_value, 0)) / NULLIF(a.useful_life_years, 0)
        * LEAST(EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / 86400 / 365.25, a.useful_life_years)
      )
    )
    -- Double-Declining Balance
    WHEN a.depreciation_mdl = 'DOUBLE_DECLINING' AND a.purchase_cost IS NOT NULL AND a.purchase_date IS NOT NULL
    THEN GREATEST(
      COALESCE(a.salvage_value, 0),
      a.purchase_cost * POWER(
        1 - (2.0 / NULLIF(a.useful_life_years, 0)),
        LEAST(EXTRACT(EPOCH FROM (NOW() - a.purchase_date)) / 86400 / 365.25, a.useful_life_years)
      )
    )
    ELSE a.purchase_cost
  END AS current_book_value
FROM assets a
WHERE a.purchase_cost IS NOT NULL AND a.purchase_date IS NOT NULL;

