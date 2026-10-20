import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export const authRouter = Router();

// Public routes
authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login',    validate(loginSchema),    login);

// Protected routes
authRouter.post('/logout', authenticate, logout);
authRouter.get('/me',      authenticate, getMe);
