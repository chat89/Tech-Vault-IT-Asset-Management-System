/**
 * types/db.types.ts
 * TypeScript interfaces that mirror the PostgreSQL schema exactly.
 * These are used throughout controllers and services.
 */

// ─── Enums ────────────────────────────────────────────────

export type AssetStatus =
  | 'available'
  | 'assigned'
  | 'under_maintenance'
  | 'retired'
  | 'disposed';

export type MaintenanceType =
  | 'preventive'
  | 'corrective'
  | 'inspection'
  | 'upgrade'
  | 'other';

export type MaintenanceStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create_asset'
  | 'update_asset'
  | 'delete_asset'
  | 'assign_asset'
  | 'return_asset'
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'create_maintenance'
  | 'update_maintenance'
  | 'change_role';

// ─── Row Interfaces ───────────────────────────────────────

export interface RoleRow {
  id: string;
  name: string;
  label: string;
  created_at: Date;
}

export interface PermissionRow {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role_id: string;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** UserRow without sensitive fields — safe to send over the wire */
export type SafeUser = Omit<UserRow, 'password_hash'> & {
  role_name?: string;
  role_label?: string;
};

export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface AssetRow {
  id: string;
  asset_tag: string;
  name: string;
  description: string | null;
  category_id: string | null;
  serial_number: string | null;
  model: string | null;
  manufacturer: string | null;
  purchase_date: Date | null;
  purchase_cost: string | null; // pg returns NUMERIC as string
  warranty_expiry: Date | null;
  status: AssetStatus;
  location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AssignmentRow {
  id: string;
  asset_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: Date;
  returned_at: Date | null;
  return_notes: string | null;
  condition_out: string;
  condition_in: string | null;
  notes: string | null;
}

export interface MaintenanceRecordRow {
  id: string;
  asset_id: string;
  maintenance_type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduled_date: Date;
  completed_date: Date | null;
  cost: string | null;
  performed_by: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

// ─── Dashboard Stats ──────────────────────────────────────

export interface DashboardStats {
  total_assets: number;
  available_assets: number;
  assigned_assets: number;
  under_maintenance: number;
  retired_assets: number;
  assets_by_category: { category: string; count: number }[];
  assets_by_status: { status: AssetStatus; count: number }[];
  recent_assignments: number; // last 30 days
  recent_audit_events: number; // last 7 days
}

