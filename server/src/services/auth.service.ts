/**
 * services/auth.service.ts
 * Handles registration, login, and token generation.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { SafeUser, UserRow, RoleRow } from '../types/db.types';

const BCRYPT_ROUNDS = 12;
const EMPLOYEE_ROLE_NAME = 'employee';

// ─── Token generation ─────────────────────────────────────

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  role_id: string;
}

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '7d',
  });

// ─── Register ─────────────────────────────────────────────

export const register = async (input: RegisterInput): Promise<{ user: SafeUser; token: string }> => {
  // 1. Check duplicate email
  const existing = await query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1',
    [input.email]
  );
  if (existing.rows.length > 0) {
    throw createError('Email is already registered', 409);
  }

  // 2. Resolve role — default to 'employee' if not supplied
  let roleId = input.role_id;
  if (!roleId) {
    const roleRes = await query<RoleRow>(
      'SELECT id FROM roles WHERE name = $1',
      [EMPLOYEE_ROLE_NAME]
    );
    if (roleRes.rows.length === 0) throw createError('Default role not found', 500);
    roleId = roleRes.rows[0].id;
  } else {
    const roleRes = await query<RoleRow>('SELECT id FROM roles WHERE id = $1', [roleId]);
    if (roleRes.rows.length === 0) throw createError('Invalid role ID', 400);
  }

  // 3. Hash password
  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  // 4. Insert user
  const { rows } = await query<UserRow & { role_name: string; role_label: string }>(
    `INSERT INTO users (full_name, email, password_hash, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING
       id, full_name, email, role_id, is_active, last_login_at, created_at, updated_at`,
    [input.full_name, input.email, password_hash, roleId]
  );

  const user = rows[0];

  // 5. Fetch role info
  const roleRes = await query<RoleRow>('SELECT name, label FROM roles WHERE id = $1', [user.role_id]);
  const roleName = roleRes.rows[0]?.name ?? EMPLOYEE_ROLE_NAME;
  const roleLabel = roleRes.rows[0]?.label ?? 'Employee';

  const safeUser: SafeUser = { ...user, role_name: roleName, role_label: roleLabel };
  const token = signToken({ id: user.id, email: user.email, role: roleName, role_id: user.role_id });

  return { user: safeUser, token };
};

// ─── Login ────────────────────────────────────────────────

export const login = async (
  input: LoginInput
): Promise<{ user: SafeUser; token: string }> => {
  // 1. Find user with role info
  const { rows } = await query<UserRow & { role_name: string; role_label: string }>(
    `SELECT u.*, r.name AS role_name, r.label AS role_label
       FROM users u
       JOIN roles r ON r.id = u.role_id
      WHERE u.email = $1`,
    [input.email]
  );

  if (rows.length === 0) {
    throw createError('Invalid email or password', 401);
  }

  const user = rows[0];

  // 2. Check active status
  if (!user.is_active) {
    throw createError('Your account has been deactivated. Contact an administrator.', 403);
  }

  // 3. Verify password
  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw createError('Invalid email or password', 401);
  }

  // 4. Update last_login_at
  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  // 5. Sign token and return safe user
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role_name,
    role_id: user.role_id,
  });

  const { password_hash: _ph, ...safeUser } = user;

  return { user: safeUser as SafeUser, token };
};

// ─── Get current user (me) ────────────────────────────────

export const getMe = async (userId: string): Promise<SafeUser> => {
  const { rows } = await query<UserRow & { role_name: string; role_label: string }>(
    `SELECT u.id, u.full_name, u.email, u.role_id, u.is_active,
            u.last_login_at, u.created_at, u.updated_at,
            r.name AS role_name, r.label AS role_label
       FROM users u
       JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1`,
    [userId]
  );

  if (rows.length === 0) throw createError('User not found', 404);
  return rows[0] as SafeUser;
};

