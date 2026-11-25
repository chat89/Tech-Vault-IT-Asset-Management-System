import { z } from 'zod';

export const telemetryWebhookSchema = z.object({
  asset_id: z.string().uuid('asset_id must be a valid UUID'),
  health_score: z
    .number()
    .int('health_score must be an integer')
    .min(0, 'health_score must be at least 0')
    .max(100, 'health_score cannot exceed 100'),
  battery_level: z
    .number()
    .int('battery_level must be an integer')
    .min(0, 'battery_level must be at least 0')
    .max(100, 'battery_level cannot exceed 100')
    .nullable()
    .optional(),
  disk_status: z.enum(['healthy', 'warning', 'critical']).default('healthy'),
  cpu_temp_c: z
    .number()
    .int()
    .min(-40, 'cpu_temp_c too low')
    .max(150, 'cpu_temp_c too high')
    .optional()
    .default(45),
});

export type TelemetryWebhookInput = z.infer<typeof telemetryWebhookSchema>;

