import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

export const assignmentRouter = Router();
assignmentRouter.use(authenticate);
assignmentRouter.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

