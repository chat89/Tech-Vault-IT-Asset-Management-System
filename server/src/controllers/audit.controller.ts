import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../db/pool';

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { action, user_id, entity_type, page = '1', limit = '50' } = req.query as Record<string, string>;
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (action)      { conditions.push(`al.action = $${idx++}`);       values.push(action); }
    if (user_id)     { conditions.push(`al.user_id = $${idx++}`);      values.push(user_id); }
    if (entity_type) { conditions.push(`al.entity_type = $${idx++}`);  values.push(entity_type); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM audit_logs al ${where}`, values
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const pageN  = parseInt(page, 10);
    const limitN = Math.min(parseInt(limit, 10), 200); // cap at 200
    const offset = (pageN - 1) * limitN;

    const dataValues = [...values, limitN, offset];
    const { rows } = await query(
      `SELECT
         al.id, al.action, al.entity_type, al.entity_id,
         al.metadata, al.ip_address, al.created_at,
         u.full_name AS user_name, u.email AS user_email
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      dataValues
    );

    res.json({
      success: true,
      data: {
        logs: rows,
        total,
        page: pageN,
        limit: limitN,
        pages: Math.ceil(total / limitN),
      },
    });
  } catch (e) { next(e); }
};

