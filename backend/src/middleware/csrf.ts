import crypto from 'node:crypto';
import type { RequestHandler } from 'express';
import { config } from '../config.js';
import { HttpError } from './errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Proteção CSRF por "double submit cookie":
 * - o servidor emite um cookie legível `vs_csrf` com valor aleatório;
 * - toda requisição de escrita precisa ecoar esse valor no header `X-CSRF-Token`.
 * Um site de terceiros não consegue ler o cookie, logo não consegue forjar o header.
 */
export const csrfProtection: RequestHandler = (req, res, next) => {
  let token: string | undefined = req.cookies?.[config.cookies.csrf];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie(config.cookies.csrf, token, {
      httpOnly: false,
      secure: config.isProd,
      sameSite: 'lax',
      path: '/',
    });
  }
  if (SAFE_METHODS.has(req.method)) return next();

  const header = req.get('x-csrf-token') ?? '';
  const valid =
    header.length === token.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(token));
  if (!valid) return next(new HttpError(403, 'Sessão expirada. Recarregue a página e tente novamente.', 'CSRF'));
  next();
};
