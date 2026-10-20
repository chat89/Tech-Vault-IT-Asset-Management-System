/**
 * controllers/user.controller.ts
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as UserService from '../services/user.service';
import { logEvent } from '../services/audit.service';

// GET /api/users
export const getAllUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: { users } });
  } catch (err) { next(err); }
};

// GET /api/users/roles
export const getRoles = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roles = await UserService.getAllRoles();
    res.json({ success: true, data: { roles } });
  } catch (err) { next(err); }
};

// GET /api/users/:id
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

// POST /api/users
export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await UserService.createUser(req.body);

    await logEvent({
      userId: req.user!.id,
      action: 'create_user',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role_name },
      req,
    });

    res.status(201).json({ success: true, message: 'User created', data: { user } });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prev = await UserService.getUserById(req.params.id);
    const user = await UserService.updateUser(req.params.id, req.body);

    await logEvent({
      userId: req.user!.id,
      action: 'update_user',
      entityType: 'user',
      entityId: user.id,
      metadata: { before: prev, after: user },
      req,
    });

    res.json({ success: true, message: 'User updated', data: { user } });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id  (soft-delete — deactivate)
export const deactivateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Prevent self-deactivation
    if (req.params.id === req.user!.id) {
      res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
      return;
    }

    await UserService.deactivateUser(req.params.id);

    await logEvent({
      userId: req.user!.id,
      action: 'delete_user',
      entityType: 'user',
      entityId: req.params.id,
      req,
    });

    res.json({ success: true, message: 'User deactivated' });
  } catch (err) { next(err); }
};

