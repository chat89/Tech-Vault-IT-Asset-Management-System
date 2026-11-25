import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export const authRouter = Router();

// Dedicated rate limiting on authentication routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

// Public routes
authRouter.post('/register', authLimiter, validate(registerSchema), register);
authRouter.post('/login',    authLimiter, validate(loginSchema),    login);

// Protected routes
authRouter.post('/logout', authenticate, logout);
authRouter.get('/me',      authenticate, getMe);
