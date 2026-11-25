import { z } from 'zod';

export const createAssetRequestSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  asset_type:  z.string().min(2, 'Asset type is required').max(100).trim(),
  priority:    z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  reason:      z.string().min(5, 'Reason must be at least 5 characters').max(2000).trim(),
});

export const updateAssetRequestStatusSchema = z.object({
  status:      z.enum(['approved', 'rejected', 'fulfilled', 'cancelled']),
  admin_notes: z.string().max(1000).trim().optional().nullable(),
  asset_id:    z.string().uuid().optional().nullable(),
});

export type CreateAssetRequestInput      = z.infer<typeof createAssetRequestSchema>;
export type UpdateAssetRequestStatusInput = z.infer<typeof updateAssetRequestStatusSchema>;

