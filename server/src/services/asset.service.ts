/**
 * services/asset.service.ts
 * Core asset lifecycle management.
 */
import { query } from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { AssetRow } from '../types/db.types';
import {
  CreateAssetInput,
  UpdateAssetInput,
  UpdateAssetStatusInput,
} from '../validators/asset.validator';

// ─── Rich asset SELECT (includes category name) ──────────
const ASSET_SELECT = `
  SELECT
    a.*,
    c.name AS category_name
  FROM assets a
  LEFT JOIN categories c ON c.id = a.category_id
`;

export interface AssetWithCategory extends AssetRow {
  category_name: string | null;
}

// ─── List with optional filters ──────────────────────────
interface ListAssetsOptions {
  status?:      string;
  category_id?: string;
  search?:      string;
  page?:        number;
  limit?:       number;
}

export const getAllAssets = async (opts: ListAssetsOptions = {}): Promise<{
  assets: AssetWithCategory[];
  total: number;
  page: number;
  limit: number;
}> => {
  const { status, category_id, search, page = 1, limit = 20 } = opts;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (status)      { conditions.push(`a.status = $${idx++}`);       values.push(status); }
  if (category_id) { conditions.push(`a.category_id = $${idx++}`);  values.push(category_id); }
  if (search)      {
    conditions.push(`(a.name ILIKE $${idx} OR a.asset_tag ILIKE $${idx} OR a.serial_number ILIKE $${idx})`);
    values.push(`%${search}%`); idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM assets a ${where}`, values
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const dataValues = [...values, limit, offset];
  const { rows } = await query<AssetWithCategory>(
    `${ASSET_SELECT} ${where} ORDER BY a.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
    dataValues
  );

  return { assets: rows, total, page, limit };
};

// ─── Get single asset ─────────────────────────────────────
export const getAssetById = async (id: string): Promise<AssetWithCategory> => {
  const { rows } = await query<AssetWithCategory>(
    `${ASSET_SELECT} WHERE a.id = $1`, [id]
  );
  if (!rows.length) throw createError('Asset not found', 404);
  return rows[0];
};

// ─── Auto-generate a unique asset tag ────────────────────
const generateAssetTag = async (prefix: string): Promise<string> => {
  const upper = prefix.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'AST';
  const { rows } = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM assets WHERE asset_tag LIKE $1`, [`${upper}-%`]
  );
  const n = parseInt(rows[0].count, 10) + 1;
  return `${upper}-${String(n).padStart(4, '0')}`;
};

// ─── Create ───────────────────────────────────────────────
export const createAsset = async (
  input: CreateAssetInput,
  createdBy: string
): Promise<AssetWithCategory> => {
  // Check duplicate asset_tag
  const dup = await query('SELECT id FROM assets WHERE asset_tag = $1', [input.asset_tag]);
  if (dup.rows.length) throw createError(`Asset tag "${input.asset_tag}" already exists`, 409);

  const { rows } = await query<AssetRow>(
    `INSERT INTO assets
       (asset_tag, name, description, category_id, serial_number, model,
        manufacturer, purchase_date, purchase_cost, salvage_value, useful_life_years,
        depreciation_mdl, warranty_expiry, status, location, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING id`,
    [
      input.asset_tag,
      input.name,
      input.description    ?? null,
      input.category_id    ?? null,
      input.serial_number  ?? null,
      input.model          ?? null,
      input.manufacturer   ?? null,
      input.purchase_date  ?? null,
      input.purchase_cost  ?? null,
      input.salvage_value  ?? null,
      input.useful_life_years ?? null,
      input.depreciation_mdl ?? 'STRAIGHT_LINE',
      input.warranty_expiry ?? null,
      input.status,
      input.location       ?? null,
      input.notes          ?? null,
      createdBy,
    ]
  );
  return getAssetById(rows[0].id);
};

// ─── Update ───────────────────────────────────────────────
export const updateAsset = async (
  id: string,
  input: UpdateAssetInput
): Promise<AssetWithCategory> => {
  await getAssetById(id);

  const fieldMap: Record<string, unknown> = {};
  const allowed: (keyof UpdateAssetInput)[] = [
    'asset_tag','name','description','category_id','serial_number',
    'model','manufacturer','purchase_date','purchase_cost',
    'salvage_value','useful_life_years','depreciation_mdl',
    'warranty_expiry','status','location','notes',
  ];
  allowed.forEach((k) => { if (k in input) fieldMap[k] = (input as Record<string, unknown>)[k]; });

  if (!Object.keys(fieldMap).length) throw createError('No fields to update', 400);

  // Duplicate tag check if changing tag
  if (fieldMap.asset_tag) {
    const dup = await query(
      'SELECT id FROM assets WHERE asset_tag = $1 AND id != $2',
      [fieldMap.asset_tag, id]
    );
    if (dup.rows.length) throw createError(`Asset tag "${fieldMap.asset_tag}" already in use`, 409);
  }

  const keys   = Object.keys(fieldMap);
  const vals   = Object.values(fieldMap);
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  vals.push(id);
  await query(`UPDATE assets SET ${setClauses} WHERE id = $${vals.length}`, vals);

  return getAssetById(id);
};

// ─── Status transition ────────────────────────────────────
export const updateAssetStatus = async (
  id: string,
  input: UpdateAssetStatusInput
): Promise<AssetWithCategory> => {
  await getAssetById(id);
  await query('UPDATE assets SET status = $1 WHERE id = $2', [input.status, id]);
  return getAssetById(id);
};

// ─── Delete ───────────────────────────────────────────────
export const deleteAsset = async (id: string): Promise<void> => {
  const asset = await getAssetById(id);
  if (asset.status === 'assigned') {
    throw createError('Cannot delete an asset that is currently assigned. Return it first.', 400);
  }
  await query('DELETE FROM assets WHERE id = $1', [id]);
};

export { generateAssetTag };

