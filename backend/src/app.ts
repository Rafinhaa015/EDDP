import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { loadUser } from './middleware/auth.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { authRouter } from './routes/auth.js';
import { courseRouter } from './routes/course.js';
import { profileRouter } from './routes/profile.js';
import { publicRouter } from './routes/public.js';

export function createApp() {
  const app = express();
  // Necessário atrás de proxy (Next.js rewrites, Render, Railway…) para obter o IP real no rate limit e nos logs LGPD.
  app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: config.appUrl, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(csrfProtection);
  app.use(loadUser);

  app.use('/api', publicRouter);
  app.use('/api/auth', authRouter);
  app.use('/api', profileRouter);
  app.use('/api', courseRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
