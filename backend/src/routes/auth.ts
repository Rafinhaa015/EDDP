import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query, transaction } from '../db.js';
import { clearSession, signSession } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { loginLimiter, sensitiveLimiter } from '../middleware/rateLimit.js';
import { resetPasswordEmail, sendEmail, welcomeEmail } from '../services/email.js';
import { emailSchema, nameSchema, passwordSchema, phoneSchema } from '../services/validation.js';

export const authRouter = Router();

// Hash usado para equalizar o tempo de resposta quando o e-mail não existe (evita enumeração de contas).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

export function clientInfo(req: import('express').Request) {
  return { ip: (req.ip ?? '0.0.0.0').replace(/^::ffff:/, '').slice(0, 45), userAgent: req.get('user-agent') ?? '' };
}

const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { error: 'É necessário concordar com os Termos de Uso e a Política de Privacidade.' }),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'As senhas não conferem.', path: ['confirmPassword'] });

authRouter.post('/register', sensitiveLimiter, async (req, res) => {
  const data = registerSchema.parse(req.body);
  const hash = await bcrypt.hash(data.password, config.bcryptRounds);
  const { ip, userAgent } = clientInfo(req);

  const user = await transaction(async (db) => {
    const exists = await db.query('SELECT 1 FROM users WHERE email = $1', [data.email]);
    if (exists.rowCount) throw new HttpError(409, 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.', 'EMAIL_TAKEN');

    const { rows } = await db.query(
      `INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at, token_version`,
      [data.name, data.email, data.phone, hash],
    );
    // Registro de aceite dos Termos (LGPD): timestamp, IP e User-Agent.
    await db.query(
      `INSERT INTO lgpd_consents (user_id, ip_address, user_agent, consent_type, terms_version, consent_given)
       VALUES ($1, $2, $3, 'terms_of_use', $4, TRUE)`,
      [rows[0].id, ip, userAgent, config.termsVersion],
    );
    return rows[0];
  });

  signSession(res, user.id, user.token_version);
  sendEmail(welcomeEmail(user.name, user.email)).catch((e) => console.error('Falha ao enviar boas-vindas', e));
  const { token_version: _v, ...safe } = user;
  res.status(201).json({ user: safe });
});

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Informe a senha.') });

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const { rows } = await query(
    'SELECT id, name, email, phone, created_at, password_hash, token_version FROM users WHERE email = $1',
    [email],
  );
  const user = rows[0];
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');

  signSession(res, user.id, user.token_version);
  const { password_hash: _h, token_version: _v, ...safe } = user;
  res.json({ user: safe });
});

authRouter.post('/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  res.json({ user: req.user ?? null });
});

authRouter.post('/forgot-password', sensitiveLimiter, async (req, res) => {
  const { email } = z.object({ email: emailSchema }).parse(req.body);
  const { rows } = await query('SELECT id, name, email FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (user) {
    const token = crypto.randomBytes(32).toString('base64url');
    await transaction(async (db) => {
      // Invalida tokens anteriores ainda não usados.
      await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [user.id]);
      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
        [user.id, sha256(token), String(config.resetTokenTtlMinutes)],
      );
    });
    await sendEmail(resetPasswordEmail(user.name, user.email, token));
  }
  // Resposta idêntica exista ou não a conta.
  res.json({ ok: true, message: 'Se o e-mail estiver cadastrado, você receberá um link válido por 15 minutos.' });
});

const resetSchema = z
  .object({ token: z.string().min(10, 'Link inválido.'), password: passwordSchema, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: 'As senhas não conferem.', path: ['confirmPassword'] });

authRouter.post('/reset-password', sensitiveLimiter, async (req, res) => {
  const { token, password } = resetSchema.parse(req.body);
  const hash = await bcrypt.hash(password, config.bcryptRounds);

  const user = await transaction(async (db) => {
    const { rows } = await db.query(
      `UPDATE password_reset_tokens SET used_at = NOW()
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
        RETURNING user_id`,
      [sha256(token)],
    );
    if (!rows[0]) throw new HttpError(400, 'Link inválido ou expirado. Solicite uma nova redefinição.', 'INVALID_TOKEN');
    const updated = await db.query(
      `UPDATE users SET password_hash = $1, token_version = token_version + 1, updated_at = NOW()
        WHERE id = $2 RETURNING id, token_version`,
      [hash, rows[0].user_id],
    );
    return updated.rows[0];
  });

  signSession(res, user.id, user.token_version);
  res.json({ ok: true });
});
