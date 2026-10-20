-- ============================================================
-- Migration: 001_initial_schema.sql
-- TechVault IT Asset Management System — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- ROLES
-- ─────────────────────────────────────────
CREATE TABLE roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(50)  UNIQUE NOT NULL,   -- 'super_admin' | 'it_admin' | 'employee'
  label      VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PERMISSIONS
-- ─────────────────────────────────────────
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,  -- e.g. 'create_asset'
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROLE → PERMISSIONS (junction)
-- ─────────────────────────────────────────
CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(150)        NOT NULL,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash TEXT                NOT NULL,
  role_id       UUID                NOT NULL REFERENCES roles(id),
  is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ─────────────────────────────────────────
-- ASSET CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ASSETS
-- ─────────────────────────────────────────
CREATE TYPE asset_status AS ENUM (
  'available',
  'assigned',
  'under_maintenance',
  'retired',
  'disposed'
);

CREATE TABLE assets (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_tag     VARCHAR(50)  UNIQUE NOT NULL,   -- human-readable tag e.g. "TV-0042"
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  category_id   UUID         REFERENCES categories(id) ON DELETE SET NULL,
  serial_number VARCHAR(150),
  model         VARCHAR(150),
  manufacturer  VARCHAR(150),
  purchase_date DATE,
  purchase_cost NUMERIC(12, 2),
  warranty_expiry DATE,
  status        asset_status NOT NULL DEFAULT 'available',
  location      VARCHAR(200),
  notes         TEXT,
  created_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_status      ON assets(status);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_asset_tag   ON assets(asset_tag);

-- ─────────────────────────────────────────
-- ASSIGNMENTS  (asset → employee)
-- ─────────────────────────────────────────
CREATE TABLE assignments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id       UUID         NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  assigned_to    UUID         NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  assigned_by    UUID         NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  assigned_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  returned_at    TIMESTAMPTZ,                             -- NULL means currently assigned
  return_notes   TEXT,
  condition_out  VARCHAR(50)  NOT NULL DEFAULT 'good',   -- condition when assigned
  condition_in   VARCHAR(50),                            -- condition when returned
  notes          TEXT
);

CREATE INDEX idx_assignments_asset_id    ON assignments(asset_id);
CREATE INDEX idx_assignments_assigned_to ON assignments(assigned_to);
CREATE INDEX idx_assignments_returned_at ON assignments(returned_at);

-- ─────────────────────────────────────────
-- MAINTENANCE RECORDS
-- ─────────────────────────────────────────
CREATE TYPE maintenance_type AS ENUM (
  'preventive',
  'corrective',
  'inspection',
  'upgrade',
  'other'
);

CREATE TYPE maintenance_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TABLE maintenance_records (
  id              UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id        UUID               NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_type maintenance_type  NOT NULL DEFAULT 'corrective',
  status          maintenance_status NOT NULL DEFAULT 'scheduled',
  description     TEXT               NOT NULL,
  scheduled_date  DATE               NOT NULL,
  completed_date  DATE,
  cost            NUMERIC(12, 2),
  performed_by    VARCHAR(200),   -- technician name / external vendor
  notes           TEXT,
  created_by      UUID               REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_asset_id ON maintenance_records(asset_id);
CREATE INDEX idx_maintenance_status   ON maintenance_records(status);

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────
CREATE TYPE audit_action AS ENUM (
  'login',
  'logout',
  'create_asset',
  'update_asset',
  'delete_asset',
  'assign_asset',
  'return_asset',
  'create_user',
  'update_user',
  'delete_user',
  'create_maintenance',
  'update_maintenance',
  'change_role'
);

CREATE TABLE audit_logs (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  action      audit_action NOT NULL,
  entity_type VARCHAR(50),              -- e.g. 'asset', 'user', 'assignment'
  entity_id   UUID,                    -- the affected record's ID
  metadata    JSONB,                   -- snapshot / diff of changes
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ─────────────────────────────────────────
-- UPDATED_AT auto-update trigger
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_assets
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_maintenance
  BEFORE UPDATE ON maintenance_records
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

