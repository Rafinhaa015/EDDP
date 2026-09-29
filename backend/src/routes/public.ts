import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db.js';
import { clientInfo } from './auth.js';

export const publicRouter = Router();

publicRouter.get('/health', async (_req, res) => {
  await query('SELECT 1');
  res.json({ ok: true });
});

publicRouter.get('/config', (_req, res) => {
  res.json({
    sequentialUnlock: config.sequentialUnlock,
    watermarkEnabled: config.watermarkEnabled,
    termsVersion: config.termsVersion,
  });
});

const cookieSchema = z.object({
  choice: z.enum(['accept_all', 'custom', 'reject']),
  preferences: z.object({ analytics: z.boolean(), marketing: z.boolean() }),
});

/** Registra a escolha do banner de cookies (visitante ou aluno logado) com timestamp, IP e User-Agent. */
publicRouter.post('/consents/cookies', async (req, res) => {
  const { choice, preferences } = cookieSchema.parse(req.body);
  const { ip, userAgent } = clientInfo(req);
  await query(
    `INSERT INTO lgpd_consents (user_id, ip_address, user_agent, consent_type, terms_version, details, consent_given)
     VALUES ($1, $2, $3, 'cookies', $4, $5, $6)`,
    [
      req.user?.id ?? null,
      ip,
      userAgent,
      config.termsVersion,
      JSON.stringify({ choice, necessary: true, ...preferences }),
      choice !== 'reject',
    ],
  );
  res.status(201).json({ ok: true });
});
