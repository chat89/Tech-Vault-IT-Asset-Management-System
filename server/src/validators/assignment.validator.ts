import { z } from 'zod';

export const assignAssetSchema = z.object({
  asset_id:      z.string().uuid('Invalid asset ID'),
  assigned_to:   z.string().uuid('Invalid user ID'),
  condition_out: z.string().max(50).trim().optional().default('good'),
  notes:         z.string().max(1000).trim().optional().nullable(),
});

export const returnAssetSchema = z.object({
  condition_in:  z.string().max(50).trim().optional().default('good'),
  return_notes:  z.string().max(1000).trim().optional().nullable(),
});

export type AssignAssetInput = z.infer<typeof assignAssetSchema>;
export type ReturnAssetInput = z.infer<typeof returnAssetSchema>;

