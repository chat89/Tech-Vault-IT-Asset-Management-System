-- ============================================================
-- Migration: 005_rich_enterprise_seed_data.sql
-- Seed realistic multi-department users, assets, assignments,
-- maintenance records, asset requests, and audit history.
-- ============================================================

-- ── 1. REALISTIC USERS ACROSS DEPARTMENTS ──
-- Default password for all seed users: Admin@1234
-- Hash: $2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O

INSERT INTO users (id, full_name, email, password_hash, role_id, is_active) VALUES
  -- IT Administrators
  ('11111111-1111-1111-1111-111111111101', 'Marcus Vance', 'marcus.vance@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000002', TRUE),
  ('11111111-1111-1111-1111-111111111102', 'Elena Rostova', 'elena.rostova@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000002', TRUE),
  
  -- Engineering Employees
  ('22222222-2222-2222-2222-222222222201', 'Alex Rivera', 'alex.rivera@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', TRUE),
  ('22222222-2222-2222-2222-222222222202', 'Sophia Chen', 'sophia.chen@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', TRUE),
  ('22222222-2222-2222-2222-222222222203', 'Liam Gallagher', 'liam.g@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', TRUE),

  -- Product & Design Employees
  ('22222222-2222-2222-2222-222222222204', 'Maya Lin', 'maya.lin@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', TRUE),
  ('22222222-2222-2222-2222-222222222205', 'Daniel Kim', 'daniel.kim@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', TRUE),

  -- Finance & Operations Employees
  ('22222222-2222-2222-2222-222222222206', 'Rachel Green', 'rachel.green@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', TRUE),
  ('22222222-2222-2222-2222-222222222207', 'Oliver Scott', 'oliver.scott@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', TRUE),
  ('22222222-2222-2222-2222-222222222208', 'Fatima Zahra', 'fatima.zahra@techvault.local', '$2a$12$kFGSweFqCReKztLZz8.scu/tV5/kCEHp19d/mzopBH/vxVdkQ628O', '00000000-0000-0000-0000-000000000003', FALSE) -- Inactive
ON CONFLICT (email) DO NOTHING;

-- ── 2. PLENTIFUL ASSETS ACROSS ALL CATEGORIES ──
-- We use existing categories: Laptop, Desktop, Monitor, Server, Printer, Network, Mobile Device, Storage, Peripherals, Software

INSERT INTO assets (id, asset_tag, name, description, category_id, serial_number, model, manufacturer, purchase_date, purchase_cost, warranty_expiry, status, location, notes, created_by)
VALUES
  -- LAPTOPS (assigned & available & maintenance)
  ('33333333-3333-3333-3333-333333333001', 'LPT-1001', 'MacBook Pro 16" M3 Max', 'High performance developer workstation for Senior AI Engineers', 
    (SELECT id FROM categories WHERE name = 'Laptop'), 'C02FX088MD6T', 'MacBook Pro 16', 'Apple Inc.', '2024-02-15', 3499.00, '2027-02-15', 'assigned', 'Building A - Floor 4', 'Includes 140W USB-C Power Adapter and sleeve', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  
  ('33333333-3333-3333-3333-333333333002', 'LPT-1002', 'MacBook Pro 14" M3 Pro', 'Engineering standard issue for Full Stack Developers',
    (SELECT id FROM categories WHERE name = 'Laptop'), 'C02FZ990MD6R', 'MacBook Pro 14', 'Apple Inc.', '2024-03-01', 2399.00, '2027-03-01', 'assigned', 'Building A - Floor 4', 'Assigned during Q1 engineering onboarding', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333003', 'LPT-1003', 'ThinkPad X1 Carbon Gen 11', 'Executive ultralight laptop with 4G LTE modem',
    (SELECT id FROM categories WHERE name = 'Laptop'), 'PF-49X82Z', 'X1 Carbon Gen 11', 'Lenovo', '2023-11-10', 1899.00, '2026-11-10', 'assigned', 'Executive Suite - Floor 7', 'Includes ThinkPad Thunderbolt 4 Dock', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333004', 'LPT-1004', 'Dell XPS 15 9530', 'Product Designer workstation with OLED 3.5K display',
    (SELECT id FROM categories WHERE name = 'Laptop'), '8K2M193', 'XPS 15 9530', 'Dell Technologies', '2024-01-20', 2599.00, '2027-01-20', 'assigned', 'Design Studio - Floor 3', 'Calibrated for DCI-P3 color gamut', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333005', 'LPT-1005', 'MacBook Air 15" M2', 'Finance & Analytics team laptop',
    (SELECT id FROM categories WHERE name = 'Laptop'), 'C02DQ211MD6P', 'MacBook Air 15', 'Apple Inc.', '2023-09-05', 1499.00, '2026-09-05', 'assigned', 'Finance Dept - Floor 2', 'Clean condition, battery health 98%', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333006', 'LPT-1006', 'Dell Latitude 7440', 'Enterprise pool unit ready for quick deployment',
    (SELECT id FROM categories WHERE name = 'Laptop'), '4J9P022', 'Latitude 7440', 'Dell Technologies', '2024-04-10', 1350.00, '2027-04-10', 'available', 'IT Storage Room B12', 'Imaged with corporate Windows 11 Enterprise image', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333007', 'LPT-1007', 'ThinkPad T14s Gen 4', 'General staff replacement unit',
    (SELECT id FROM categories WHERE name = 'Laptop'), 'PF-32B81Q', 'T14s Gen 4', 'Lenovo', '2024-04-15', 1280.00, '2027-04-15', 'available', 'IT Storage Room B12', 'Ready for handover', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333008', 'LPT-1008', 'MacBook Pro 16" M1 Pro', 'Display flickering issue, sent to authorized service center',
    (SELECT id FROM categories WHERE name = 'Laptop'), 'C02GL110MD6K', 'MacBook Pro 16', 'Apple Inc.', '2022-05-18', 2799.00, '2025-05-18', 'under_maintenance', 'Apple Authorized Service Provider', 'Ticket #APPLE-892110 for panel replacement', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333009', 'LPT-1009', 'Dell Precision 7560', 'Legacy workstation retired following 4-year lifecycle',
    (SELECT id FROM categories WHERE name = 'Laptop'), '2D8N001', 'Precision 7560', 'Dell Technologies', '2020-03-12', 3200.00, '2023-03-12', 'retired', 'Depot Warehouse A', 'Hard drive sanitized and certified per DoD standards', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- MONITORS
  ('33333333-3333-3333-3333-333333333010', 'MON-2001', 'Dell UltraSharp U2723QE 4K', '27-inch 4K IPS Black Hub Monitor with USB-C 90W PD',
    (SELECT id FROM categories WHERE name = 'Monitor'), 'CN-0M9Y87', 'U2723QE', 'Dell Technologies', '2023-08-14', 620.00, '2026-08-14', 'assigned', 'Desk A-402 (Alex R.)', 'Includes HDMI and USB-C upstream cables', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333011', 'MON-2002', 'Dell UltraSharp U2723QE 4K', 'Dual monitor setup secondary display',
    (SELECT id FROM categories WHERE name = 'Monitor'), 'CN-0M9Y88', 'U2723QE', 'Dell Technologies', '2023-08-14', 620.00, '2026-08-14', 'assigned', 'Desk A-402 (Alex R.)', 'Connected via DisplayPort MST daisy chain', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333012', 'MON-2003', 'Apple Studio Display 27" 5K', '5K Retina display with 12MP Ultra Wide camera',
    (SELECT id FROM categories WHERE name = 'Monitor'), 'APL-SD-9921', 'Studio Display', 'Apple Inc.', '2024-01-22', 1599.00, '2027-01-22', 'assigned', 'Design Studio Desk D-1', 'Nano-texture glass version', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333013', 'MON-2004', 'LG 34WN80C-B Ultrawide 34"', '34-inch 21:9 Curved UltraWide QHD IPS display',
    (SELECT id FROM categories WHERE name = 'Monitor'), '401NTAG8390', '34WN80C-B', 'LG Electronics', '2023-06-30', 550.00, '2026-06-30', 'available', 'IT Storage Room B12', 'Boxed with desk mount clamp', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333014', 'MON-2005', 'LG 34WN80C-B Ultrawide 34"', 'Ultrawide display with flickering HDMI input port',
    (SELECT id FROM categories WHERE name = 'Monitor'), '401NTAG8391', '34WN80C-B', 'LG Electronics', '2023-06-30', 550.00, '2026-06-30', 'under_maintenance', 'Electronics Lab Workstation 2', 'Port solder inspection underway', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- SERVERS & INFRASTRUCTURE
  ('33333333-3333-3333-3333-333333333015', 'SRV-3001', 'PowerEdge R760 Rack Server', 'Primary Kubernetes worker node: 2x Intel Xeon Gold, 512GB ECC DDR5, 8x 3.84TB NVMe',
    (SELECT id FROM categories WHERE name = 'Server'), 'PE-R760-9901', 'PowerEdge R760', 'Dell Technologies', '2023-12-01', 14850.00, '2028-12-01', 'available', 'Server Room Rack 04 - U12-U14', 'Dual 1400W redundant power supplies, iDRAC9 Enterprise', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333016', 'SRV-3002', 'PowerEdge R660xs Server', 'Database backup replica & staging cluster host',
    (SELECT id FROM categories WHERE name = 'Server'), 'PE-R660-8802', 'PowerEdge R660xs', 'Dell Technologies', '2024-02-18', 9200.00, '2029-02-18', 'available', 'Server Room Rack 04 - U10', 'Attached to SAN 10Gbps iSCSI', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- NETWORK INFRASTRUCTURE
  ('33333333-3333-3333-3333-333333333017', 'NET-4001', 'Cisco Catalyst 9300-48P', '48-Port PoE+ Managed Enterprise Core Switch',
    (SELECT id FROM categories WHERE name = 'Network'), 'FOC241920X', 'Catalyst 9300-48P', 'Cisco Systems', '2023-05-10', 4800.00, '2028-05-10', 'available', 'MDF Room - Rack 01', 'Powering Floor 3 & 4 VoIP phones and APs', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333018', 'NET-4002', 'Ubiquiti UniFi U6 Enterprise', 'Wi-Fi 6E 10.2 Gbps Quad-Radio ceiling access point',
    (SELECT id FROM categories WHERE name = 'Network'), '68D79A20B810', 'U6 Enterprise', 'Ubiquiti Inc.', '2023-09-12', 299.00, '2026-09-12', 'available', 'Floor 4 West Wing Hallway', 'PoE+ powered via Catalyst 9300', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333019', 'NET-4003', 'Fortinet FortiGate 100F', 'Next-Gen Firewall with SSL Inspection & IPS',
    (SELECT id FROM categories WHERE name = 'Network'), 'FG100FTK230198', 'FortiGate 100F', 'Fortinet', '2023-04-05', 3890.00, '2026-04-05', 'available', 'MDF Room - Rack 01 - U20', 'High Availability cluster master node', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- MOBILE DEVICES
  ('33333333-3333-3333-3333-333333333020', 'MOB-5001', 'iPhone 15 Pro 256GB', 'QA Testing device for Mobile iOS App release pipeline',
    (SELECT id FROM categories WHERE name = 'Mobile Device'), 'DN6J8021MD6T', 'iPhone 15 Pro', 'Apple Inc.', '2023-10-15', 1099.00, '2025-10-15', 'assigned', 'Mobile QA Lab', 'Enrolled in corporate MDM with test certificates', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333021', 'MOB-5002', 'Samsung Galaxy S24 Ultra', 'QA Android device for compatibility matrix tests',
    (SELECT id FROM categories WHERE name = 'Mobile Device'), 'R58N208912P', 'Galaxy S24 Ultra', 'Samsung Electronics', '2024-02-05', 1299.00, '2026-02-05', 'available', 'IT Storage Safe 2', 'Unused, ready for QA check-out', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- ENTERPRISE PRINTERS
  ('33333333-3333-3333-3333-333333333022', 'PRN-6001', 'HP LaserJet Enterprise M608dn', 'High volume monochrome duplex network printer',
    (SELECT id FROM categories WHERE name = 'Printer'), 'VNB3B09122', 'LaserJet M608dn', 'HP Inc.', '2022-08-20', 1199.00, '2025-08-20', 'available', 'Floor 3 Copy Center', 'Total page count: 82,410 pages', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- STORAGE & BACKUP
  ('33333333-3333-3333-3333-333333333023', 'STO-7001', 'Synology RackStation RS2423+', '12-Bay Network Attached Storage for local disaster recovery',
    (SELECT id FROM categories WHERE name = 'Storage'), '2180QBR82190', 'RS2423+', 'Synology Inc.', '2023-07-11', 2800.00, '2028-07-11', 'available', 'Server Room Rack 02', 'Equipped with 12x 18TB Seagate IronWolf Pro in RAID 6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  -- PERIPHERALS
  ('33333333-3333-3333-3333-333333333024', 'PER-8001', 'CalDigit TS4 Thunderbolt 4 Dock', '18-port flagship Thunderbolt 4 workstation hub',
    (SELECT id FROM categories WHERE name = 'Peripherals'), 'TS4-US-20819', 'TS4', 'CalDigit', '2024-01-15', 399.00, '2026-01-15', 'assigned', 'Desk A-402', 'Paired with LPT-1001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('33333333-3333-3333-3333-333333333025', 'PER-8002', 'Logitech MX Master 3S + Keys Combo', 'Ergonomic wireless keyboard and high-precision mouse',
    (SELECT id FROM categories WHERE name = 'Peripherals'), '2145LZ08991', 'MX Master 3S Combo', 'Logitech', '2024-02-10', 219.00, '2026-02-10', 'available', 'IT Supply Cabinet 1', 'Brand new in sealed box', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (asset_tag) DO NOTHING;

-- ── 3. HISTORIC & ACTIVE ASSIGNMENTS ──
INSERT INTO assignments (id, asset_id, assigned_to, assigned_by, assigned_at, returned_at, return_notes, condition_out, condition_in, notes)
VALUES
  -- Active: Alex Rivera has LPT-1001, MON-2001, and PER-8001
  ('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '2024-02-16 09:30:00+00', NULL, NULL, 'mint', NULL, 'Standard senior dev deployment bundle'),
  ('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333010', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '2024-02-16 09:40:00+00', NULL, NULL, 'good', NULL, 'Primary desk monitor'),
  ('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333024', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '2024-02-16 09:45:00+00', NULL, NULL, 'mint', NULL, 'Thunderbolt dock'),

  -- Active: Sophia Chen has LPT-1002 and MON-2002
  ('44444444-4444-4444-4444-444444444004', '33333333-3333-3333-3333-333333333002', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', '2024-03-02 10:15:00+00', NULL, NULL, 'mint', NULL, 'Onboarding hardware issue'),
  ('44444444-4444-4444-4444-444444444005', '33333333-3333-3333-3333-333333333011', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', '2024-03-02 10:20:00+00', NULL, NULL, 'good', NULL, 'Workstation monitor'),

  -- Active: Maya Lin has LPT-1004 and MON-2003 (Design Studio)
  ('44444444-4444-4444-4444-444444444006', '33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', '2024-01-25 14:00:00+00', NULL, NULL, 'mint', NULL, 'Product Designer workstation'),
  ('44444444-4444-4444-4444-444444444007', '33333333-3333-3333-3333-333333333012', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', '2024-01-25 14:10:00+00', NULL, NULL, 'mint', NULL, 'Studio display color calibrated'),

  -- Active: Daniel Kim has MOB-5001 (iOS QA)
  ('44444444-4444-4444-4444-444444444008', '33333333-3333-3333-3333-333333333020', '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111102', '2024-02-01 11:00:00+00', NULL, NULL, 'mint', NULL, 'Assigned for Mobile App release verification'),

  -- Historic (Returned): Liam Gallagher previously had Dell Latitude 7440 and returned it in good condition
  ('44444444-4444-4444-4444-444444444009', '33333333-3333-3333-3333-333333333006', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', '2023-04-10 09:00:00+00', '2024-04-01 17:00:00+00', 'Returned upon role transfer to backend team', 'mint', 'good', 'Re-imaged and moved back to ready pool')
ON CONFLICT (id) DO NOTHING;

-- ── 4. REALISTIC MAINTENANCE RECORDS ──
INSERT INTO maintenance_records (id, asset_id, maintenance_type, status, description, scheduled_date, completed_date, cost, performed_by, notes, created_by)
VALUES
  ('55555555-5555-5555-5555-555555555001', '33333333-3333-3333-3333-333333333008', 'corrective', 'in_progress', 'Liquid Retina XDR panel flickering at 120Hz ProMotion; diagnostic indicated T-Con ribbon cable fault.', '2024-04-18', NULL, 480.00, 'Apple Authorized Service Specialist', 'Awaiting parts delivery from Cupertino logistics hub', '11111111-1111-1111-1111-111111111101'),
  
  ('55555555-5555-5555-5555-555555555002', '33333333-3333-3333-3333-333333333014', 'corrective', 'scheduled', 'HDMI port 2 unstable with occasional signal loss. Testing logic board solder joint integrity.', '2024-04-25', NULL, 85.00, 'Internal IT Lab - Technician Marcus', 'Workstation 2 queue slot 4', '11111111-1111-1111-1111-111111111101'),

  ('55555555-5555-5555-5555-555555555003', '33333333-3333-3333-3333-333333333015', 'preventive', 'completed', 'Bi-annual server datacenter maintenance: chassis dust evacuation, thermal paste re-application, and firmware update to BIOS 2.14.0', '2024-03-10', '2024-03-10', 250.00, 'Dell ProSupport Field Engineer', 'Full diagnostic suite passed with 0 memory errors', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

  ('55555555-5555-5555-5555-555555555004', '33333333-3333-3333-3333-333333333022', 'preventive', 'completed', 'Roller assembly replacement, transfer belt cleaning, and genuine HP toner cartridge replenishment.', '2024-02-28', '2024-02-28', 195.00, 'Xerox & HP Managed Print Vendor', 'Maintenance kit 50k page cycle installed', '11111111-1111-1111-1111-111111111102')
ON CONFLICT (id) DO NOTHING;

-- ── 5. ASSET REQUISITION WORKFLOW REQUESTS ──
INSERT INTO asset_requests (id, user_id, category_id, asset_type, priority, reason, status, admin_notes, reviewed_by, reviewed_at)
VALUES
  -- Pending request from Alex Rivera (Needs 4K secondary monitor for code reviews)
  ('66666666-6666-6666-6666-666666666001', '22222222-2222-2222-2222-222222222201', 
    (SELECT id FROM categories WHERE name = 'Monitor'), 'UltraSharp 27" 4K', 'high', 
    'Require a second monitor for multi-cluster Kubernetes log tracing and simultaneous IDE debugging.', 
    'pending', NULL, NULL, NULL),

  -- Pending request from Daniel Kim (Needs test iPad for tablet responsive viewport QA)
  ('66666666-6666-6666-6666-666666666002', '22222222-2222-2222-2222-222222222205', 
    (SELECT id FROM categories WHERE name = 'Mobile Device'), 'iPad Pro 11" M2', 'medium', 
    'Starting mobile responsive regression testing cycle for client portal Q2 release.', 
    'pending', NULL, NULL, NULL),

  -- Approved request from Sophia Chen (Hardware ergonomic accessories)
  ('66666666-6666-6666-6666-666666666003', '22222222-2222-2222-2222-222222222202', 
    (SELECT id FROM categories WHERE name = 'Peripherals'), 'Ergonomic Split Keyboard', 'medium', 
    'Ergonomic workstation evaluation recommendation from Occupational Health & Safety.', 
    'approved', 'Approved per ergonomic policy. Order placed with procurement batch #401.', '11111111-1111-1111-1111-111111111101', '2024-04-12 11:30:00+00'),

  -- Fulfilled request from Maya Lin
  ('66666666-6666-6666-6666-666666666004', '22222222-2222-2222-2222-222222222204', 
    (SELECT id FROM categories WHERE name = 'Monitor'), 'Studio Display 27"', 'urgent', 
    'Urgent color grading display required for high-fidelity marketing site illustrations.', 
    'fulfilled', 'Fulfilled with asset tag MON-2003 on Jan 25, 2024.', '11111111-1111-1111-1111-111111111102', '2024-01-24 16:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- ── 6. REALISTIC AUDIT TRAILS ──
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at)
VALUES
  ('77777777-7777-7777-7777-777777777001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'login', 'user', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"email": "admin@techvault.local"}'::jsonb, '127.0.0.1'::inet, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '3 hours'),
  ('77777777-7777-7777-7777-777777777002', '11111111-1111-1111-1111-111111111101', 'create_asset', 'asset', '33333333-3333-3333-3333-333333333001', '{"asset_tag": "LPT-1001", "name": "MacBook Pro 16\" M3 Max"}'::jsonb, '192.168.1.45'::inet, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '2 days'),
  ('77777777-7777-7777-7777-777777777003', '11111111-1111-1111-1111-111111111101', 'assign_asset', 'assignment', '44444444-4444-4444-4444-444444444001', '{"asset_id": "33333333-3333-3333-3333-333333333001", "assigned_to": "Alex Rivera"}'::jsonb, '192.168.1.45'::inet, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '2 days'),
  ('77777777-7777-7777-7777-777777777004', '11111111-1111-1111-1111-111111111101', 'create_maintenance', 'maintenance', '55555555-5555-5555-5555-555555555001', '{"asset_id": "33333333-3333-3333-3333-333333333008", "type": "corrective"}'::jsonb, '192.168.1.45'::inet, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

