import { rateLimit } from 'express-rate-limit';
import { config } from '../config.js';

/** Máximo de 5 tentativas de login INCORRETAS por minuto por IP (logins bem-sucedidos não contam). */
export const loginLimiter = rateLimit({
  windowMs: config.loginRateLimit.windowMs,
  limit: config.loginRateLimit.max,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 1 minuto e tente novamente.', code: 'RATE_LIMITED' },
});

/** Limita abusos em cadastro e recuperação de senha (envio de e-mails). */
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas solicitações. Tente novamente em alguns minutos.', code: 'RATE_LIMITED' },
});
