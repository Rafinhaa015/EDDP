import type { CookieOptions, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db.js';
import { HttpError } from './errors.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: Date;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface TokenPayload {
  sub: string;
  ver: number;
}

export const authCookieOptions: CookieOptions = {
  httpOnly: true, // inacessível via JavaScript → mitiga roubo de sessão por XSS
  secure: config.isProd,
  sameSite: 'lax', // + token CSRF de dupla submissão nas rotas de escrita
  path: '/',
};

export function signSession(res: Response, userId: string, tokenVersion: number) {
  const token = jwt.sign({ sub: userId, ver: tokenVersion } satisfies TokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
  const decoded = jwt.decode(token) as { exp: number };
  res.cookie(config.cookies.auth, token, {
    ...authCookieOptions,
    expires: new Date(decoded.exp * 1000),
  });
}

export function clearSession(res: Response) {
  res.clearCookie(config.cookies.auth, authCookieOptions);
}

/** Popula req.user quando há sessão válida; não bloqueia. */
export const loadUser: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[config.cookies.auth];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret) as unknown as TokenPayload;
    const { rows } = await query<AuthUser & { token_version: number }>(
      'SELECT id, name, email, phone, created_at, token_version FROM users WHERE id = $1',
      [payload.sub],
    );
    const user = rows[0];
    if (user && user.token_version === payload.ver) {
      const { token_version: _v, ...safe } = user;
      req.user = safe;
    }
  } catch {
    // token inválido/expirado → segue como visitante
  }
  next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new HttpError(401, 'Faça login para continuar.', 'UNAUTHENTICATED'));
  next();
};
