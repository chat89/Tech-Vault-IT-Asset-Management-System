/**
 * services/category.service.ts
 */
import { query } from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { CategoryRow } from '../types/db.types';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export const getAllCategories = async (): Promise<CategoryRow[]> => {
  const { rows } = await query<CategoryRow>(
    'SELECT * FROM categories ORDER BY name ASC'
  );
  return rows;
};

export const getCategoryById = async (id: string): Promise<CategoryRow> => {
  const { rows } = await query<CategoryRow>(
    'SELECT * FROM categories WHERE id = $1', [id]
  );
  if (!rows.length) throw createError('Category not found', 404);
  return rows[0];
};

export const createCategory = async (input: CreateCategoryInput): Promise<CategoryRow> => {
  const exists = await query('SELECT id FROM categories WHERE name = $1', [input.name]);
  if (exists.rows.length) throw createError('Category name already exists', 409);

  const { rows } = await query<CategoryRow>(
    `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *`,
    [input.name, input.description ?? null]
  );
  return rows[0];
};

export const updateCategory = async (id: string, input: UpdateCategoryInput): Promise<CategoryRow> => {
  await getCategoryById(id);
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (input.name        !== undefined) { fields.push(`name = $${idx++}`);        values.push(input.name); }
  if (input.description !== undefined) { fields.push(`description = $${idx++}`); values.push(input.description); }
  if (!fields.length) throw createError('No fields to update', 400);

  values.push(id);
  await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  return getCategoryById(id);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await getCategoryById(id);
  // Null-out category references in assets (ON DELETE SET NULL handles DB side)
  await query('DELETE FROM categories WHERE id = $1', [id]);
};

