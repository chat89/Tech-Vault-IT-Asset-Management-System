/**
 * services/user.service.ts
 * CRUD operations for user management (Super Admin / IT Admin only).
 */

import bcrypt from 'bcryptjs';
import { query } from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { SafeUser, UserRow } from '../types/db.types';
import { CreateUserInput, UpdateUserInput } from '../validators/user.validator';

const BCRYPT_ROUNDS = 12;

const USER_SELECT = `
  SELECT u.id, u.full_name, u.email, u.role_id, u.is_active,
         u.last_login_at, u.created_at, u.updated_at,
         r.name  AS role_name,
         r.label AS role_label
    FROM users u
    JOIN roles r ON r.id = u.role_id
`;

// ─── List all users ───────────────────────────────────────

export const getAllUsers = async (): Promise<SafeUser[]> => {
  const { rows } = await query<SafeUser>(`${USER_SELECT} ORDER BY u.created_at DESC`);
  return rows;
};

// ─── Get single user ──────────────────────────────────────

export const getUserById = async (id: string): Promise<SafeUser> => {
  const { rows } = await query<SafeUser>(`${USER_SELECT} WHERE u.id = $1`, [id]);
  if (rows.length === 0) throw createError('User not found', 404);
  return rows[0];
};

// ─── Create user (admin action) ───────────────────────────

export const createUser = async (input: CreateUserInput): Promise<SafeUser> => {
  // Check duplicate email
  const existing = await query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1',
    [input.email]
  );
  if (existing.rows.length > 0) throw createError('Email already in use', 409);

  // Validate role
  const roleRes = await query<{ id: string }>(
    'SELECT id FROM roles WHERE id = $1',
    [input.role_id]
  );
  if (roleRes.rows.length === 0) throw createError('Invalid role ID', 400);

  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const { rows } = await query<UserRow>(
    `INSERT INTO users (full_name, email, password_hash, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.full_name, input.email, password_hash, input.role_id]
  );

  return getUserById(rows[0].id);
};

// ─── Update user ──────────────────────────────────────────

export const updateUser = async (id: string, input: UpdateUserInput): Promise<SafeUser> => {
  // Ensure user exists
  await getUserById(id);

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (input.full_name !== undefined) { fields.push(`full_name = $${idx++}`); values.push(input.full_name); }
  if (input.email !== undefined)     { fields.push(`email = $${idx++}`);     values.push(input.email); }
  if (input.role_id !== undefined)   { fields.push(`role_id = $${idx++}`);   values.push(input.role_id); }
  if (input.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(input.is_active); }

  if (fields.length === 0) throw createError('No fields to update', 400);

  values.push(id);
  await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );

  return getUserById(id);
};

// ─── Deactivate / delete user ─────────────────────────────

export const deactivateUser = async (id: string): Promise<void> => {
  await getUserById(id);
  await query('UPDATE users SET is_active = FALSE WHERE id = $1', [id]);
};

// ─── Get all roles ────────────────────────────────────────

export const getAllRoles = async () => {
  const { rows } = await query('SELECT id, name, label FROM roles ORDER BY label');
  return rows;
};

