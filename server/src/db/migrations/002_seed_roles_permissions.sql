-- ============================================================
-- Migration: 002_seed_roles_permissions.sql
-- Seed: Roles, Permissions, Role-Permission mappings
-- ============================================================

-- ─── Roles ────────────────────────────────────────────────
INSERT INTO roles (id, name, label) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin',  'Super Admin'),
  ('00000000-0000-0000-0000-000000000002', 'it_admin',     'IT Administrator'),
  ('00000000-0000-0000-0000-000000000003', 'employee',     'Employee')
ON CONFLICT (name) DO NOTHING;

-- ─── Permissions ──────────────────────────────────────────
INSERT INTO permissions (id, name, description) VALUES
  ('00000000-0000-0000-0001-000000000001', 'create_asset',    'Create a new asset'),
  ('00000000-0000-0000-0001-000000000002', 'update_asset',    'Edit an existing asset'),
  ('00000000-0000-0000-0001-000000000003', 'delete_asset',    'Delete an asset'),
  ('00000000-0000-0000-0001-000000000004', 'assign_asset',    'Assign / unassign asset to employee'),
  ('00000000-0000-0000-0001-000000000005', 'view_reports',    'View dashboard reports and audit logs'),
  ('00000000-0000-0000-0001-000000000006', 'manage_users',    'Create, update, deactivate users'),
  ('00000000-0000-0000-0001-000000000007', 'view_assets',     'View asset list and details'),
  ('00000000-0000-0000-0001-000000000008', 'manage_maintenance', 'Create and update maintenance records')
ON CONFLICT (name) DO NOTHING;

-- ─── Super Admin — all permissions ────────────────────────
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- ─── IT Admin — asset + report permissions ────────────────
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id
FROM permissions
WHERE name IN (
  'create_asset',
  'update_asset',
  'delete_asset',
  'assign_asset',
  'view_reports',
  'view_assets',
  'manage_maintenance'
)
ON CONFLICT DO NOTHING;

-- ─── Employee — view only ─────────────────────────────────
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id
FROM permissions
WHERE name IN ('view_assets')
ON CONFLICT DO NOTHING;

