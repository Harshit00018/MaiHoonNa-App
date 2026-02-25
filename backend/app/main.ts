import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './api/auth';
import usersRouter from './api/users';
import subscriptionsRouter from './api/subscriptions';
import beneficiariesRouter from './api/beneficiaries';
import visitsRouter from './api/visits';
import medicationsRouter from './api/medications';
import emergencyRouter from './api/emergency';
import dashboardRouter from './api/dashboard';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
const API = '/api';

app.get(`${API}`, (_req, res) => {
  res.json({ message: 'MaiHoonNa API', version: '1.0.0', status: 'active' });
});

app.use(`${API}/auth`, authRouter);
app.use(`${API}/users`, usersRouter);
app.use(`${API}/subscriptions`, subscriptionsRouter);
app.use(`${API}/beneficiaries`, beneficiariesRouter);
app.use(`${API}/visits`, visitsRouter);
app.use(`${API}/medications`, medicationsRouter);
app.use(`${API}/emergency`, emergencyRouter);
app.use(`${API}/dashboard`, dashboardRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;