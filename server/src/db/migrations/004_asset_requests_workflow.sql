-- ============================================================
-- Migration: 004_asset_requests_workflow.sql
-- Add employee asset requisition workflow & permissions
-- ============================================================

-- Create Request Status and Priority ENUMs
DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Asset Requests Table
CREATE TABLE IF NOT EXISTS asset_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  asset_id        UUID REFERENCES assets(id) ON DELETE SET NULL,
  asset_type      VARCHAR(100),
  priority        request_priority NOT NULL DEFAULT 'medium',
  reason          TEXT NOT NULL,
  status          request_status NOT NULL DEFAULT 'pending',
  admin_notes     TEXT,
  reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_requests_user ON asset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_requests_status ON asset_requests(status);
CREATE INDEX IF NOT EXISTS idx_asset_requests_created ON asset_requests(created_at DESC);

-- Trigger for auto updated_at
DROP TRIGGER IF EXISTS set_updated_at_asset_requests ON asset_requests;
CREATE TRIGGER set_updated_at_asset_requests
  BEFORE UPDATE ON asset_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Add new permissions for requesting and managing requests
INSERT INTO permissions (id, name, description) VALUES
  ('00000000-0000-0000-0001-000000000009', 'create_request', 'Create asset requests (Employees)'),
  ('00000000-0000-0000-0001-000000000010', 'manage_requests', 'Review, approve and reject asset requests (Admins)')
ON CONFLICT (name) DO NOTHING;

-- Map permissions to roles
-- Super Admin: all
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000009'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000010')
ON CONFLICT DO NOTHING;

-- IT Admin: can manage requests and create requests
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000009'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000010')
ON CONFLICT DO NOTHING;

-- Employee: can create requests
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000009')
ON CONFLICT DO NOTHING;

