// ─── Auth ─────────────────────────────────────────────────
export interface User {
  id: string;
  full_name: string;
  email: string;
  role_id: string;
  role_name: string;
  role_label: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  label: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Assets ───────────────────────────────────────────────
export type AssetStatus = 'available' | 'assigned' | 'under_maintenance' | 'retired' | 'disposed';

export interface Asset {
  id: string;
  asset_tag: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
  serial_number: string | null;
  model: string | null;
  manufacturer: string | null;
  purchase_date: string | null;
  purchase_cost: string | number | null;
  warranty_expiry: string | null;
  status: AssetStatus;
  location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetsResponse {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
}

// ─── Categories ───────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// ─── Assignments ──────────────────────────────────────────
export interface Assignment {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_tag: string;
  assigned_to: string;
  assigned_to_name: string;
  assigned_by: string;
  assigned_by_name: string;
  assigned_at: string;
  returned_at: string | null;
  return_notes: string | null;
  condition_out: string;
  condition_in: string | null;
  notes: string | null;
}

// ─── Maintenance ──────────────────────────────────────────
export type MaintenanceType   = 'preventive' | 'corrective' | 'inspection' | 'upgrade' | 'other';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_tag: string;
  maintenance_type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduled_date: string;
  completed_date: string | null;
  cost: string | number | null;
  performed_by: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Dashboard ────────────────────────────────────────────
export interface DashboardStats {
  total_assets: number;
  available_assets: number;
  assigned_assets: number;
  under_maintenance: number;
  retired_assets: number;
  assets_by_category: { category: string; count: number }[];
  assets_by_status: { status: AssetStatus; count: number }[];
  recent_assignments: number;
  recent_audit_events: number;
  // Financial
  total_purchase_cost: number;
  total_current_book_value: number;
  total_depreciation: number;
}

// ─── Procurement Forecasting ──────────────────────────────
export type ForecastingRiskLevel = 'CRITICAL' | 'WARNING' | 'HEALTHY';

export interface CategoryForecast {
  category_id: string;
  category_name: string;
  total_assets: number;
  available_stock: number;
  assigned_stock: number;
  maintenance_stock: number;
  pending_requests: number;
  monthly_burn_rate: number;
  daily_burn_rate: number;
  runway_days: number | null;
  risk_level: ForecastingRiskLevel;
  projected_stockout_date: string | null;
  suggested_reorder_qty: number;
}

export interface ForecastingOverview {
  critical_categories_count: number;
  warning_categories_count: number;
  healthy_categories_count: number;
  total_recommended_reorder_units: number;
  categories: CategoryForecast[];
}

// ─── Audit Logs ───────────────────────────────────────────
export interface AuditLog {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Asset Requests ───────────────────────────────────────
export type RequestStatus   = 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AssetRequest {
  id: string;
  user_id: string;
  category_id: string | null;
  asset_id: string | null;
  asset_type: string;
  priority: RequestPriority;
  reason: string;
  status: RequestStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  requester_name: string;
  requester_email: string;
  category_name: string | null;
  allocated_asset_name: string | null;
  allocated_asset_tag: string | null;
  reviewer_name: string | null;
}

// ─── API Generic ──────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

