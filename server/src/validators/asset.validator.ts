import { z } from 'zod';

const assetStatusValues = ['available', 'assigned', 'under_maintenance', 'retired', 'disposed'] as const;
const depreciationModelValues = ['STRAIGHT_LINE', 'DOUBLE_DECLINING'] as const;

export const createAssetSchema = z.object({
  asset_tag:        z.string().min(1, 'Asset tag is required').max(50).trim(),
  name:             z.string().min(1, 'Name is required').max(200).trim(),
  description:      z.string().max(1000).trim().optional(),
  category_id:      z.string().uuid('Invalid category ID').optional().nullable(),
  serial_number:    z.string().max(150).trim().optional().nullable(),
  model:            z.string().max(150).trim().optional().nullable(),
  manufacturer:     z.string().max(150).trim().optional().nullable(),
  purchase_date:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)').optional().nullable(),
  purchase_cost:    z.number().nonnegative().optional().nullable(),
  salvage_value:    z.number().nonnegative().optional().nullable(),
  useful_life_years: z.number().int().min(1).max(50).optional().nullable(),
  depreciation_mdl: z.enum(depreciationModelValues).optional().nullable(),
  warranty_expiry:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)').optional().nullable(),
  status:           z.enum(assetStatusValues).optional().default('available'),
  location:         z.string().max(200).trim().optional().nullable(),
  notes:            z.string().max(2000).trim().optional().nullable(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const updateAssetStatusSchema = z.object({
  status: z.enum(assetStatusValues, { required_error: 'Status is required' }),
});

export type CreateAssetInput       = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput       = z.infer<typeof updateAssetSchema>;
export type UpdateAssetStatusInput = z.infer<typeof updateAssetStatusSchema>;

