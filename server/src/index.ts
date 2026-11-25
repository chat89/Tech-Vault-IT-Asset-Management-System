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
import { requestRouter } from './routes/request.routes';
import financialRouter from './routes/financial.routes';
import telemetryRouter from './routes/telemetry.routes';
import analyticsRouter from './routes/analytics.routes';
import { startTelemetrySimulator } from './services/telemetry.service';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || origin === clientOrigin || origin === 'http://localhost:5173' || origin === 'http://localhost:3000') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, or set to clientOrigin
      }
    },
    credentials: true,
  })
);
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
app.use('/api/requests', requestRouter);
app.use('/api/financial', financialRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/analytics', analyticsRouter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 TechVault server running on http://localhost:${PORT}`);
  // Start MDM telemetry simulator
  startTelemetrySimulator().catch((err) => {
    console.error('[Telemetry Simulator] Failed to start:', err);
  });
});

export default app;

