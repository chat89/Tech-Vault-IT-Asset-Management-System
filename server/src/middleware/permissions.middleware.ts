/**
 * middleware/permissions.middleware.ts
 * Fine-grained permission-based guards (used alongside role guards).
 * Loads the user's role permissions from DB and checks against required permission.
 */

import { Response, NextFunction } from 'express';
import { query } from '../db/pool';
import { createError } from './errorHandler';
import { AuthRequest } from './auth.middleware';

/** Cache permission sets per role for the lifetime of the process (refreshed on restart) */
const permissionCache = new Map<string, Set<string>>();

const getPermissionsForRole = async (roleId: string): Promise<Set<string>> => {
  if (permissionCache.has(roleId)) return permissionCache.get(roleId)!;

  const { rows } = await query<{ name: string }>(
    `SELECT p.name
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = $1`,
    [roleId]
  );

  const set = new Set(rows.map((r) => r.name));
  permissionCache.set(roleId, set);
  return set;
};

/** Clear the cache (e.g. after role permission changes) */
export const clearPermissionCache = (): void => permissionCache.clear();

/**
 * requirePermission('create_asset')
 * Middleware that checks the authenticated user has the specified permission.
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) return next(createError('Unauthorized', 401));

    try {
      const permissions = await getPermissionsForRole(req.user.role_id);
      const hasAll = requiredPermissions.every((p) => permissions.has(p));

      if (!hasAll) {
        return next(
          createError(
            `Forbidden: missing permission(s): ${requiredPermissions.join(', ')}`,
            403
          )
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

