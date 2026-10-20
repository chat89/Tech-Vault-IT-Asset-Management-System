import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/permissions.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import {
  getAllUsers,
  getRoles,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
} from '../controllers/user.controller';

export const userRouter = Router();

// All user routes require authentication
userRouter.use(authenticate);

// GET /api/users/roles  — list available roles (admin+ only)
userRouter.get('/roles', authorize('super_admin', 'it_admin'), getRoles);

// GET /api/users        — list all users (admin+ only)
userRouter.get('/', authorize('super_admin', 'it_admin'), requirePermission('manage_users'), getAllUsers);

// GET /api/users/:id    — get single user
userRouter.get('/:id', authorize('super_admin', 'it_admin'), getUserById);

// POST /api/users       — create new user (super_admin only)
userRouter.post(
  '/',
  authorize('super_admin'),
  requirePermission('manage_users'),
  validate(createUserSchema),
  createUser
);

// PATCH /api/users/:id  — update user (super_admin only)
userRouter.patch(
  '/:id',
  authorize('super_admin'),
  requirePermission('manage_users'),
  validate(updateUserSchema),
  updateUser
);

// DELETE /api/users/:id — deactivate user (super_admin only)
userRouter.delete(
  '/:id',
  authorize('super_admin'),
  requirePermission('manage_users'),
  deactivateUser
);
