-- ============================================================
-- Migration: 003_seed_admin_user.sql
-- Seed: Default Super Admin user
-- Password: Admin@1234  (bcrypt hash — change in production!)
-- ============================================================

INSERT INTO users (
  id,
  full_name,
  email,
  password_hash,
  role_id,
  is_active
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'System Administrator',
  'admin@techvault.local',
  -- bcrypt hash of 'Admin@1234'  (cost factor 12)
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oMuHk1PoS',
  '00000000-0000-0000-0000-000000000001',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- ─── Default Asset Categories ─────────────────────────────
INSERT INTO categories (name, description) VALUES
  ('Laptop',        'Portable computers and notebooks'),
  ('Desktop',       'Desktop tower computers and workstations'),
  ('Monitor',       'Display screens and monitors'),
  ('Server',        'Physical and rack-mounted servers'),
  ('Printer',       'Printers, scanners, and copiers'),
  ('Network',       'Routers, switches, access points'),
  ('Mobile Device', 'Smartphones and tablets'),
  ('Storage',       'External drives, USBs, NAS devices'),
  ('Peripherals',   'Keyboards, mice, webcams, headsets'),
  ('Software',      'Software licenses and subscriptions'),
  ('Other',         'Miscellaneous IT assets')
ON CONFLICT (name) DO NOTHING;

