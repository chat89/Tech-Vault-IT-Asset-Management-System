import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { assetRouter } from './routes/asset.routes';
import { categoryRouter } from './routes/category.routes';
import { assignmentRouter } from './routes/assignment.routes';
import { maintenanceRouter } from './routes/maintenance.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { auditRouter } from './routes/audit.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
  })
);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/assets', assetRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/assignments', assignmentRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/audit-logs', auditRouter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 TechVault server running on http://localhost:${PORT}`);
});

export default app;

