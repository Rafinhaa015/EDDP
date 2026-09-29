import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { pool } from '../src/db.js';
import * as email from '../src/services/email.js';
import { migrate } from '../src/scripts/migrate.js';

const app = createApp();

const rand = () => Math.floor(Math.random() * 250) + 1;

async function newAgent() {
  // IP distinto por agente para que o rate limit de um teste não interfira nos outros.
  const ip = `10.${rand()}.${rand()}.${rand()}`;
  const agent = request.agent(app).set('X-Forwarded-For', ip);
  const res = await agent.get('/api/auth/me');
  const cookie = ([] as string[]).concat(res.headers['set-cookie'] ?? []).find((c) => c.startsWith('vs_csrf='))!;
  const csrf = cookie.split(';')[0].split('=')[1];
  return { agent, csrf };
}

const unique = () => `aluno.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@teste.com`;
const password = 'Senha1234';

async function register(emailAddr = unique()) {
  const { agent, csrf } = await newAgent();
  const res = await agent
    .post('/api/auth/register')
    .set('X-CSRF-Token', csrf)
    .set('User-Agent', 'vitest-agent')
    .send({ name: 'Maria Silva', email: emailAddr, phone: '+55 (11) 91234-5678', password, confirmPassword: password, acceptTerms: true });
  return { agent, csrf, res, email: emailAddr };
}

beforeAll(async () => {
  await migrate();
  await pool.query('TRUNCATE users CASCADE');
  await pool.query('DELETE FROM lgpd_consents');
});
afterAll(() => pool.end());

describe('autenticação', () => {
  it('rejeita escrita sem token CSRF', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'x' });
    expect(res.status).toBe(403);
  });

  it('cadastra, registra aceite LGPD e cria sessão em cookie HttpOnly', async () => {
    const { res, agent, email: addr } = await register();
    expect(res.status).toBe(201);
    expect(res.body.user.phone).toBe('+5511912345678');
    expect(res.body.user.password_hash).toBeUndefined();
    const session = ([] as string[]).concat(res.headers['set-cookie']).find((c) => c.startsWith('vs_session='))!;
    expect(session).toMatch(/HttpOnly/i);

    const { rows } = await pool.query(
      `SELECT c.* FROM lgpd_consents c JOIN users u ON u.id = c.user_id WHERE u.email = $1`, [addr],
    );
    expect(rows[0]).toMatchObject({ consent_type: 'terms_of_use', consent_given: true, user_agent: 'vitest-agent' });
    expect(rows[0].ip_address).toBeTruthy();

    const { rows: hashRows } = await pool.query('SELECT password_hash FROM users WHERE email = $1', [addr]);
    expect(hashRows[0].password_hash).toMatch(/^\$2[aby]\$1\d\$/);

    const me = await agent.get('/api/auth/me');
    expect(me.body.user.email).toBe(addr);
  });

  it('exige aceite dos termos e senhas iguais', async () => {
    const { agent, csrf } = await newAgent();
    const base = { name: 'João Souza', email: unique(), phone: '+5511999998888', password, confirmPassword: password };
    const noTerms = await agent.post('/api/auth/register').set('X-CSRF-Token', csrf).send({ ...base, acceptTerms: false });
    expect(noTerms.status).toBe(400);
    const mismatch = await agent.post('/api/auth/register').set('X-CSRF-Token', csrf).send({ ...base, confirmPassword: 'Outra1234', acceptTerms: true });
    expect(mismatch.status).toBe(400);
    expect(mismatch.body.error).toMatch(/não conferem/);
  });

  it('bloqueia e-mail duplicado', async () => {
    const { email: addr } = await register();
    const again = await register(addr);
    expect(again.res.status).toBe(409);
  });

  it('aplica rate limit após 5 logins incorretos por minuto', async () => {
    const { email: addr } = await register();
    const { agent, csrf } = await newAgent();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const r = await agent.post('/api/auth/login').set('X-CSRF-Token', csrf).send({ email: addr, password: 'Errada123' });
      statuses.push(r.status);
    }
    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);
  });

  it('recupera senha com token de uso único', async () => {
    const { email: addr } = await register();
    const spy = vi.spyOn(email, 'sendEmail');
    const { agent, csrf } = await newAgent();
    const forgot = await agent.post('/api/auth/forgot-password').set('X-CSRF-Token', csrf).send({ email: addr });
    expect(forgot.status).toBe(200);
    const msg = spy.mock.calls.at(-1)![0];
    const token = decodeURIComponent(msg.text.match(/token=([^\s]+)/)![1]);

    const { rows } = await pool.query(
      `SELECT t.expires_at - t.created_at AS ttl FROM password_reset_tokens t JOIN users u ON u.id = t.user_id WHERE u.email = $1`, [addr],
    );
    expect(rows[0].ttl.minutes).toBe(15);

    const reset = await agent.post('/api/auth/reset-password').set('X-CSRF-Token', csrf)
      .send({ token, password: 'NovaSenha99', confirmPassword: 'NovaSenha99' });
    expect(reset.status).toBe(200);
    const reuse = await agent.post('/api/auth/reset-password').set('X-CSRF-Token', csrf)
      .send({ token, password: 'NovaSenha98', confirmPassword: 'NovaSenha98' });
    expect(reuse.status).toBe(400);

    const login = await (await newAgent()).agent.post('/api/auth/login');
    expect(login.status).toBe(403); // sem CSRF
    const fresh = await newAgent();
    const ok = await fresh.agent.post('/api/auth/login').set('X-CSRF-Token', fresh.csrf).send({ email: addr, password: 'NovaSenha99' });
    expect(ok.status).toBe(200);
    spy.mockRestore();
  });
});

describe('curso, progresso e certificado', () => {
  it('bloqueia rotas sem login', async () => {
    expect((await request(app).get('/api/course')).status).toBe(401);
  });

  it('percorre o curso: bloqueio sequencial, progresso, anotações, materiais e certificado', async () => {
    const { agent, csrf } = await register();
    let course = (await agent.get('/api/course')).body;
    expect(course.modules).toHaveLength(3);
    expect(course.totalLessons).toBe(9);
    expect(course.modules.map((m: any) => m.locked)).toEqual([false, true, true]);
    expect(course.percent).toBe(0);

    const locked = course.modules[1].lessons[0];
    expect((await agent.get(`/api/lessons/${locked.slug}`)).status).toBe(403);

    const first = course.modules[0].lessons[0];
    const lesson = (await agent.get(`/api/lessons/${first.slug}`)).body;
    expect(lesson.stream.url).toMatch(/\.m3u8/);
    expect(lesson.downloads[0].url).toBe('/api/materials/mapa-resiliencia');
    expect(lesson.watermark).toContain('@teste.com');

    const note = await agent.put(`/api/lessons/${first.id}/notes`).set('X-CSRF-Token', csrf).send({ content: 'Não é pessoal!' });
    expect(note.body.content).toBe('Não é pessoal!');

    const pdf = await agent.get('/api/materials/mapa-resiliencia').buffer(true);
    expect(pdf.status).toBe(200);
    expect(pdf.headers['content-type']).toBe('application/pdf');
    expect((await agent.get('/api/materials/script-vendas')).status).toBe(403);

    expect((await agent.get('/api/certificate')).body.eligible).toBe(false);

    for (const mod of course.modules) {
      for (const l of mod.lessons) {
        const r = await agent.post(`/api/lessons/${l.id}/complete`).set('X-CSRF-Token', csrf).send({ completed: true });
        expect(r.status).toBe(200);
        course = r.body;
      }
    }
    expect(course.percent).toBe(100);
    expect(course.modules.every((m: any) => m.status === 'completed' && !m.locked)).toBe(true);

    const cert = (await agent.get('/api/certificate')).body;
    expect(cert.eligible).toBe(true);
    expect(cert.certificate.code).toMatch(/^VS-[0-9A-F]{10}$/);
    const certPdf = await agent.get('/api/certificate/pdf').buffer(true);
    expect(certPdf.headers['content-type']).toBe('application/pdf');
    const verify = await request(app).get(`/api/certificate/verify/${cert.certificate.code}`);
    expect(verify.body).toMatchObject({ valid: true, name: 'Maria Silva' });
  });
});

describe('perfil e LGPD', () => {
  it('edita perfil, troca senha, exporta e exclui dados', async () => {
    const { agent, csrf, email: addr } = await register();
    const upd = await agent.patch('/api/profile').set('X-CSRF-Token', csrf).send({ name: 'Maria Souza', phone: '+1 415 555 0100' });
    expect(upd.body.user).toMatchObject({ name: 'Maria Souza', phone: '+14155550100' });

    const wrong = await agent.post('/api/profile/password').set('X-CSRF-Token', csrf)
      .send({ currentPassword: 'errada', newPassword: 'Outra1234', confirmPassword: 'Outra1234' });
    expect(wrong.status).toBe(400);
    const changed = await agent.post('/api/profile/password').set('X-CSRF-Token', csrf)
      .send({ currentPassword: password, newPassword: 'Outra1234', confirmPassword: 'Outra1234' });
    expect(changed.status).toBe(200);
    expect((await agent.get('/api/auth/me')).body.user.email).toBe(addr); // sessão atual renovada

    const exported = await agent.get('/api/profile/export');
    const data = JSON.parse(exported.text);
    expect(data.dados_cadastrais.email).toBe(addr);
    expect(data.consentimentos).toHaveLength(1);
    expect(data.dados_cadastrais.password_hash).toBeUndefined();

    const cookies = await agent.post('/api/consents/cookies').set('X-CSRF-Token', csrf)
      .send({ choice: 'custom', preferences: { analytics: true, marketing: false } });
    expect(cookies.status).toBe(201);

    const bad = await agent.delete('/api/profile').set('X-CSRF-Token', csrf).send({ password: 'Outra1234', confirmation: 'sim' });
    expect(bad.status).toBe(400);
    const del = await agent.delete('/api/profile').set('X-CSRF-Token', csrf).send({ password: 'Outra1234', confirmation: 'EXCLUIR' });
    expect(del.status).toBe(200);
    const { rowCount } = await pool.query('SELECT 1 FROM users WHERE email = $1', [addr]);
    expect(rowCount).toBe(0);
    expect((await agent.get('/api/auth/me')).body.user).toBeNull();
  });
});
