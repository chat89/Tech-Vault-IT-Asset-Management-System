import { z } from 'zod';

const maintenanceTypeValues   = ['preventive','corrective','inspection','upgrade','other'] as const;
const maintenanceStatusValues = ['scheduled','in_progress','completed','cancelled'] as const;

export const createMaintenanceSchema = z.object({
  asset_id:         z.string().uuid('Invalid asset ID'),
  maintenance_type: z.enum(maintenanceTypeValues).default('corrective'),
  status:           z.enum(maintenanceStatusValues).default('scheduled'),
  description:      z.string().min(1, 'Description is required').max(2000).trim(),
  scheduled_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
  completed_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  cost:             z.number().nonnegative().optional().nullable(),
  performed_by:     z.string().max(200).trim().optional().nullable(),
  notes:            z.string().max(2000).trim().optional().nullable(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial().omit({ asset_id: true });

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;

