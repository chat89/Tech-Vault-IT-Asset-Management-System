import { query } from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { CreateAssetRequestInput, UpdateAssetRequestStatusInput } from '../validators/request.validator';

const REQUEST_SELECT = `
  SELECT
    ar.*,
    u.full_name AS requester_name,
    u.email AS requester_email,
    c.name AS category_name,
    a.name AS allocated_asset_name,
    a.asset_tag AS allocated_asset_tag,
    r.full_name AS reviewer_name
  FROM asset_requests ar
  JOIN users u ON u.id = ar.user_id
  LEFT JOIN categories c ON c.id = ar.category_id
  LEFT JOIN assets a ON a.id = ar.asset_id
  LEFT JOIN users r ON r.id = ar.reviewed_by
`;

export const getAssetRequests = async (filters: { user_id?: string; status?: string }) => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.user_id) {
    conditions.push(`ar.user_id = $${idx++}`);
    values.push(filters.user_id);
  }
  if (filters.status) {
    conditions.push(`ar.status = $${idx++}`);
    values.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`${REQUEST_SELECT} ${where} ORDER BY ar.created_at DESC`, values);
  return rows;
};

export const getAssetRequestById = async (id: string) => {
  const { rows } = await query(`${REQUEST_SELECT} WHERE ar.id = $1`, [id]);
  if (!rows.length) throw createError('Asset request not found', 404);
  return rows[0];
};

export const createAssetRequest = async (userId: string, input: CreateAssetRequestInput) => {
  const { rows } = await query<{ id: string }>(
    `INSERT INTO asset_requests (user_id, category_id, asset_type, priority, reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      userId,
      input.category_id ?? null,
      input.asset_type,
      input.priority,
      input.reason,
    ]
  );
  return getAssetRequestById(rows[0].id);
};

export const updateAssetRequestStatus = async (
  id: string,
  reviewerId: string,
  reviewerRole: string,
  input: UpdateAssetRequestStatusInput
) => {
  const request = await getAssetRequestById(id) as { user_id: string; status: string };

  // ─── Segregation of Duties Enforcement ───────────────────────────────────
  // An IT Admin or Super Admin CANNOT approve/reject/fulfill a request they created.
  if (
    (input.status === 'approved' || input.status === 'rejected' || input.status === 'fulfilled') &&
    (reviewerRole === 'it_admin' || reviewerRole === 'super_admin') &&
    request.user_id === reviewerId
  ) {
    // Log the SoD violation attempt as a high-severity SECURITY_ALERT
    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          reviewerId,
          'update_asset',
          'SECURITY_ALERT',
          id,
          JSON.stringify({
            violation: 'SOD_VIOLATION',
            attempted_action: input.status,
            severity: 'HIGH',
            message: 'Admin attempted to self-approve own requisition — blocked by SoD policy',
          }),
        ]
      );
    } catch (_) {
      // Security log failures must not suppress the actual 403 error
    }

    throw createError(
      'Segregation of Duties (SoD) violation: You cannot approve, reject, or fulfill a request you submitted yourself. Another administrator must review it.',
      403
    );
  }

  const { rows } = await query<{ id: string }>(
    `UPDATE asset_requests
     SET status = $1,
         admin_notes = $2,
         asset_id = $3,
         reviewed_by = $4,
         reviewed_at = NOW()
     WHERE id = $5
     RETURNING id`,
    [
      input.status,
      input.admin_notes ?? null,
      input.asset_id ?? null,
      reviewerId,
      id,
    ]
  );

  return getAssetRequestById(rows[0].id);
};
