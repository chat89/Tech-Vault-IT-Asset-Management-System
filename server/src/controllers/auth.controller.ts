/**
 * controllers/auth.controller.ts
 * Thin handlers — delegate all logic to the auth service.
 */

import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { logEvent } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';

// POST /api/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, token } = await AuthService.register(req.body);

    await logEvent({
      userId: user.id,
      action: 'create_user',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role_name },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, token } = await AuthService.login(req.body);

    await logEvent({
      userId: user.id,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email },
      req,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout  (client drops token; server logs the event)
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user) {
      await logEvent({
        userId: req.user.id,
        action: 'logout',
        entityType: 'user',
        entityId: req.user.id,
        req,
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

