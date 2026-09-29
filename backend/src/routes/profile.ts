import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query, transaction } from '../db.js';
import { clearSession, requireAuth, signSession } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { getCourse } from '../services/course.js';
import { renderCertificate } from '../services/pdf.js';
import { nameSchema, passwordSchema, phoneSchema } from '../services/validation.js';

export const profileRouter = Router();

// ---------- Verificação pública de certificado ----------
profileRouter.get('/certificate/verify/:code', async (req, res) => {
  const { rows } = await query(
    `SELECT u.name, c.code, c.issued_at FROM certificates c JOIN users u ON u.id = c.user_id WHERE c.code = $1`,
    [String(req.params.code).toUpperCase()],
  );
  if (!rows[0]) throw new HttpError(404, 'Certificado não encontrado.');
  res.json({ valid: true, name: rows[0].name, code: rows[0].code, issuedAt: rows[0].issued_at, course: config.productName });
});

profileRouter.use(requireAuth);

const profileSchema = z.object({ name: nameSchema, phone: phoneSchema });

profileRouter.patch('/profile', async (req, res) => {
  const { name, phone } = profileSchema.parse(req.body);
  const { rows } = await query(
    `UPDATE users SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3
     RETURNING id, name, email, phone, created_at`,
    [name, phone, req.user!.id],
  );
  res.json({ user: rows[0] });
});

const passwordChangeSchema = z
  .object({ currentPassword: z.string().min(1, 'Informe a senha atual.'), newPassword: passwordSchema, confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'As senhas não conferem.', path: ['confirmPassword'] });

profileRouter.post('/profile/password', async (req, res) => {
  const { currentPassword, newPassword } = passwordChangeSchema.parse(req.body);
  const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
  if (!(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
    throw new HttpError(400, 'Senha atual incorreta.', 'WRONG_PASSWORD');
  }
  const hash = await bcrypt.hash(newPassword, config.bcryptRounds);
  // Incrementa token_version → encerra sessões em outros dispositivos; esta sessão recebe um novo token.
  const updated = await query(
    'UPDATE users SET password_hash = $1, token_version = token_version + 1, updated_at = NOW() WHERE id = $2 RETURNING token_version',
    [hash, req.user!.id],
  );
  signSession(res, req.user!.id, updated.rows[0].token_version);
  res.json({ ok: true });
});

// ---------- LGPD: portabilidade (Art. 18, V) ----------
profileRouter.get('/profile/export', async (req, res) => {
  const id = req.user!.id;
  const [user, progress, notes, consents, certificate] = await Promise.all([
    query('SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = $1', [id]),
    query(
      `SELECT l.title AS aula, p.completed AS concluida, p.last_position_seconds, p.updated_at
         FROM user_progress p JOIN lessons l ON l.id = p.lesson_id WHERE p.user_id = $1 ORDER BY p.updated_at`,
      [id],
    ),
    query(
      `SELECT l.title AS aula, n.content, n.updated_at FROM user_notes n JOIN lessons l ON l.id = n.lesson_id
        WHERE n.user_id = $1 ORDER BY n.updated_at`,
      [id],
    ),
    query(
      `SELECT consent_type, terms_version, consent_given, ip_address, user_agent, details, accepted_at
         FROM lgpd_consents WHERE user_id = $1 ORDER BY accepted_at`,
      [id],
    ),
    query('SELECT code, issued_at FROM certificates WHERE user_id = $1', [id]),
  ]);

  const payload = {
    exportado_em: new Date().toISOString(),
    controlador: { nome: config.productName, contato: config.supportEmail },
    dados_cadastrais: user.rows[0],
    progresso: progress.rows,
    anotacoes: notes.rows,
    consentimentos: consents.rows,
    certificado: certificate.rows[0] ?? null,
  };
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': 'attachment; filename="meus-dados.json"',
    'Cache-Control': 'no-store',
  });
  res.send(JSON.stringify(payload, null, 2));
});

// ---------- LGPD: eliminação (Art. 18, VI) ----------
const deleteSchema = z.object({
  password: z.string().min(1, 'Informe sua senha para confirmar.'),
  confirmation: z.literal('EXCLUIR', { error: 'Digite EXCLUIR para confirmar.' }),
});

profileRouter.delete('/profile', async (req, res) => {
  const { password } = deleteSchema.parse(req.body);
  const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
  if (!(await bcrypt.compare(password, rows[0].password_hash))) {
    throw new HttpError(400, 'Senha incorreta.', 'WRONG_PASSWORD');
  }
  // ON DELETE CASCADE remove progresso, anotações, consentimentos, tokens e certificado.
  await query('DELETE FROM users WHERE id = $1', [req.user!.id]);
  clearSession(res);
  res.json({ ok: true });
});

// ---------- Certificado ----------
function newCode() {
  return 'VS-' + crypto.randomBytes(5).toString('hex').toUpperCase();
}

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m ? `${h}h${String(m).padStart(2, '0')}min` : `${h} horas`;
}

async function issueCertificate(userId: string) {
  return transaction(async (db) => {
    const existing = await db.query('SELECT code, issued_at FROM certificates WHERE user_id = $1', [userId]);
    if (existing.rows[0]) return existing.rows[0] as { code: string; issued_at: Date };
    const { rows } = await db.query(
      'INSERT INTO certificates (user_id, code) VALUES ($1, $2) RETURNING code, issued_at',
      [userId, newCode()],
    );
    return rows[0] as { code: string; issued_at: Date };
  });
}

profileRouter.get('/certificate', async (req, res) => {
  const course = await getCourse(req.user!.id);
  if (!course.completed) {
    res.json({ eligible: false, percent: course.percent, certificate: null });
    return;
  }
  const cert = await issueCertificate(req.user!.id);
  res.json({ eligible: true, percent: 100, certificate: { code: cert.code, issuedAt: cert.issued_at } });
});

profileRouter.get('/certificate/pdf', async (req, res) => {
  const course = await getCourse(req.user!.id);
  if (!course.completed) throw new HttpError(403, 'Conclua 100% do curso para emitir o certificado.', 'NOT_COMPLETED');
  const cert = await issueCertificate(req.user!.id);
  const totalSeconds = course.modules.reduce((s, m) => s + m.durationSeconds, 0);
  const pdf = await renderCertificate({
    name: req.user!.name,
    code: cert.code,
    issuedAt: new Date(cert.issued_at),
    totalHours: formatHours(totalSeconds),
    modules: course.modules.map((m) => m.title),
  });
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="certificado-${cert.code}.pdf"`,
    'Cache-Control': 'private, no-store',
  });
  res.send(pdf);
});
