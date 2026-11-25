/**
 * services/assignment.service.ts
 * Asset assignment / return lifecycle + history.
 */
import { query } from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { AssignmentRow } from '../types/db.types';
import { AssignAssetInput, ReturnAssetInput } from '../validators/assignment.validator';

// ─── Enriched row (with names joined) ────────────────────
const ASSIGNMENT_SELECT = `
  SELECT
    a.id, a.asset_id, a.assigned_to, a.assigned_by,
    a.assigned_at, a.returned_at, a.return_notes,
    a.condition_out, a.condition_in, a.notes,
    ast.name       AS asset_name,
    ast.asset_tag,
    u_to.full_name AS assigned_to_name,
    u_by.full_name AS assigned_by_name
  FROM assignments a
  JOIN assets ast  ON ast.id = a.asset_id
  JOIN users u_to  ON u_to.id = a.assigned_to
  JOIN users u_by  ON u_by.id = a.assigned_by
`;

// ─── List all (with optional active-only filter) ─────────
export const getAllAssignments = async (activeOnly = false) => {
  const where = activeOnly ? 'WHERE a.returned_at IS NULL' : '';
  const { rows } = await query(`${ASSIGNMENT_SELECT} ${where} ORDER BY a.assigned_at DESC`);
  return rows;
};

// ─── History for a specific asset ────────────────────────
export const getAssetHistory = async (assetId: string) => {
  const { rows } = await query(
    `${ASSIGNMENT_SELECT} WHERE a.asset_id = $1 ORDER BY a.assigned_at DESC`,
    [assetId]
  );
  return rows;
};

// ─── History for a specific user ─────────────────────────
export const getUserAssignments = async (userId: string) => {
  const { rows } = await query(
    `${ASSIGNMENT_SELECT} WHERE a.assigned_to = $1 ORDER BY a.assigned_at DESC`,
    [userId]
  );
  return rows;
};

// ─── Assign an asset ─────────────────────────────────────
export const assignAsset = async (
  input: AssignAssetInput,
  assignedBy: string
) => {
  // 1. Check asset exists + is available
  const assetRes = await query<{ id: string; status: string }>(
    'SELECT id, status FROM assets WHERE id = $1', [input.asset_id]
  );
  if (!assetRes.rows.length)          throw createError('Asset not found', 404);
  if (assetRes.rows[0].status !== 'available')
    throw createError(`Asset is not available (current status: ${assetRes.rows[0].status})`, 400);

  // 2. Check target user exists + is active
  const userRes = await query<{ id: string; is_active: boolean }>(
    'SELECT id, is_active FROM users WHERE id = $1', [input.assigned_to]
  );
  if (!userRes.rows.length)          throw createError('Target user not found', 404);
  if (!userRes.rows[0].is_active)    throw createError('Cannot assign to a deactivated user', 400);

  // 3. Create assignment record + update asset status atomically
  const client = await (await import('../db/pool')).default.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query<AssignmentRow>(
      `INSERT INTO assignments (asset_id, assigned_to, assigned_by, condition_out, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [input.asset_id, input.assigned_to, assignedBy, input.condition_out, input.notes ?? null]
    );

    await client.query(
      `UPDATE assets SET status = 'assigned' WHERE id = $1`, [input.asset_id]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─── Return an asset ──────────────────────────────────────
export const returnAsset = async (
  assignmentId: string,
  input: ReturnAssetInput
) => {
  // 1. Find active assignment
  const res = await query<{ id: string; asset_id: string; returned_at: Date | null }>(
    'SELECT id, asset_id, returned_at FROM assignments WHERE id = $1', [assignmentId]
  );
  if (!res.rows.length)        throw createError('Assignment not found', 404);
  if (res.rows[0].returned_at) throw createError('Asset has already been returned', 400);

  const { asset_id } = res.rows[0];

  const client = await (await import('../db/pool')).default.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE assignments
          SET returned_at  = NOW(),
              condition_in  = $1,
              return_notes  = $2
        WHERE id = $3`,
      [input.condition_in, input.return_notes ?? null, assignmentId]
    );

    await client.query(
      `UPDATE assets SET status = 'available' WHERE id = $1`, [asset_id]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

