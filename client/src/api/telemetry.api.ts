/**
 * api/telemetry.api.ts
 * Telemetry (MDM health) API client
 */
import apiClient from './client';

export interface TelemetryRecord {
  id: string;
  asset_id: string;
  health_score: number;
  battery_level: number | null;
  disk_status: 'healthy' | 'warning' | 'critical';
  cpu_temp_c: number;
  last_ping: string;
  created_at: string;
}

export const telemetryApi = {
  list: () =>
    apiClient.get<{ success: boolean; data: { telemetry: TelemetryRecord[] } }>('/telemetry'),
  byAsset: (assetId: string) =>
    apiClient.get<{ success: boolean; data: { telemetry: TelemetryRecord[] } }>(`/telemetry/${assetId}`),
};

