import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { isDbConnected } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientUrls, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
  app.use(express.json({ limit: '512kb' }));
  if (!env.isProduction) app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      service: 'vtag-api',
      demo: true,
      db: isDbConnected() ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/owner', vehicleRoutes, historyRoutes);
  app.use('/api/public', publicRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
