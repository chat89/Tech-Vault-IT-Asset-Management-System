/**
 * services/maintenance.service.ts
 */
import { query } from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { MaintenanceRecordRow } from '../types/db.types';
import { CreateMaintenanceInput, UpdateMaintenanceInput } from '../validators/maintenance.validator';

const MR_SELECT = `
  SELECT
    m.*,
    a.name       AS asset_name,
    a.asset_tag
  FROM maintenance_records m
  JOIN assets a ON a.id = m.asset_id
`;

export const getAllMaintenanceRecords = async (assetId?: string) => {
  if (assetId) {
    const { rows } = await query(`${MR_SELECT} WHERE m.asset_id = $1 ORDER BY m.scheduled_date DESC`, [assetId]);
    return rows;
  }
  const { rows } = await query(`${MR_SELECT} ORDER BY m.scheduled_date DESC`);
  return rows;
};

export const getMaintenanceById = async (id: string) => {
  const { rows } = await query(`${MR_SELECT} WHERE m.id = $1`, [id]);
  if (!rows.length) throw createError('Maintenance record not found', 404);
  return rows[0];
};

export const createMaintenance = async (
  input: CreateMaintenanceInput,
  createdBy: string
) => {
  // Verify asset exists
  const assetRes = await query('SELECT id FROM assets WHERE id = $1', [input.asset_id]);
  if (!assetRes.rows.length) throw createError('Asset not found', 404);

  const { rows } = await query<MaintenanceRecordRow>(
    `INSERT INTO maintenance_records
       (asset_id, maintenance_type, status, description, scheduled_date,
        completed_date, cost, performed_by, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      input.asset_id, input.maintenance_type, input.status, input.description,
      input.scheduled_date, input.completed_date ?? null, input.cost ?? null,
      input.performed_by ?? null, input.notes ?? null, createdBy,
    ]
  );

  // If status is 'in_progress' or 'scheduled', mark asset under_maintenance
  if (['scheduled', 'in_progress'].includes(input.status)) {
    await query(
      `UPDATE assets SET status = 'under_maintenance' WHERE id = $1 AND status = 'available'`,
      [input.asset_id]
    );
  }

  return getMaintenanceById(rows[0].id);
};

export const updateMaintenance = async (id: string, input: UpdateMaintenanceInput) => {
  await getMaintenanceById(id);

  const fieldMap: Record<string, unknown> = {};
  const allowed: (keyof UpdateMaintenanceInput)[] = [
    'maintenance_type','status','description','scheduled_date',
    'completed_date','cost','performed_by','notes',
  ];
  allowed.forEach((k) => { if (k in input) fieldMap[k] = (input as Record<string, unknown>)[k]; });
  if (!Object.keys(fieldMap).length) throw createError('No fields to update', 400);

  const keys  = Object.keys(fieldMap);
  const vals  = Object.values(fieldMap);
  const set   = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  vals.push(id);
  await query(`UPDATE maintenance_records SET ${set} WHERE id = $${vals.length}`, vals);

  // If completed → return asset to available
  const updated = await getMaintenanceById(id);
  if (input.status === 'completed') {
    await query(
      `UPDATE assets SET status = 'available'
       WHERE id = $1 AND status = 'under_maintenance'`,
      [(updated as { asset_id: string }).asset_id]
    );
  }

  return updated;
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  await getMaintenanceById(id);
  await query('DELETE FROM maintenance_records WHERE id = $1', [id]);
};

