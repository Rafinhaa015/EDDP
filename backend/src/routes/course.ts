import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { materials } from '../content/materials.js';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { findLesson, getCourse } from '../services/course.js';
import { renderMaterial } from '../services/pdf.js';
import { signVideoUrl } from '../services/video.js';

export const courseRouter = Router();
courseRouter.use(requireAuth);

courseRouter.get('/course', async (req, res) => {
  res.json(await getCourse(req.user!.id));
});

/** Resolve a aula (por id ou slug) e garante que a sessão dela está liberada para o aluno. */
async function resolveLesson(userId: string, idOrSlug: string) {
  const course = await getCourse(userId);
  const found = findLesson(course, idOrSlug);
  if (!found) throw new HttpError(404, 'Aula não encontrada.');
  if (found.module.locked) {
    throw new HttpError(403, 'Conclua 100% da sessão anterior para liberar esta aula.', 'MODULE_LOCKED');
  }
  return { course, ...found };
}

courseRouter.get('/lessons/:id', async (req, res) => {
  const { course, module, lesson } = await resolveLesson(req.user!.id, req.params.id as string);
  const flat = course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, locked: m.locked })));
  const idx = flat.findIndex((l) => l.id === lesson.id);
  const prev = flat[idx - 1];
  const next = flat[idx + 1];

  const [{ rows: videoRows }, { rows: noteRows }] = await Promise.all([
    query('SELECT video_url, pdf_attachment_url FROM lessons WHERE id = $1', [lesson.id]),
    query('SELECT content, updated_at FROM user_notes WHERE user_id = $1 AND lesson_id = $2', [req.user!.id, lesson.id]),
  ]);

  const downloads: { title: string; url: string }[] = [];
  if (module.material) downloads.push({ title: module.material.title, url: `/api/materials/${module.material.key}` });
  if (videoRows[0]?.pdf_attachment_url) downloads.push({ title: 'Anexo da aula', url: videoRows[0].pdf_attachment_url });

  res.set('Cache-Control', 'no-store');
  res.json({
    lesson,
    module: { id: module.id, slug: module.slug, title: module.title, orderIndex: module.orderIndex },
    stream: signVideoUrl(videoRows[0].video_url),
    downloads,
    note: noteRows[0] ?? { content: '', updated_at: null },
    prev: prev ? { id: prev.id, slug: prev.slug, title: prev.title } : null,
    next: next ? { id: next.id, slug: next.slug, title: next.title, locked: next.locked } : null,
    watermark: config.watermarkEnabled ? req.user!.email : null,
    coursePercent: course.percent,
  });
});

courseRouter.post('/lessons/:id/complete', async (req, res) => {
  const { completed } = z.object({ completed: z.boolean().default(true) }).parse(req.body ?? {});
  const { lesson } = await resolveLesson(req.user!.id, req.params.id as string);
  await query(
    `INSERT INTO user_progress (user_id, lesson_id, completed, updated_at) VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = EXCLUDED.completed, updated_at = NOW()`,
    [req.user!.id, lesson.id, completed],
  );
  res.json(await getCourse(req.user!.id));
});

courseRouter.put('/lessons/:id/position', async (req, res) => {
  const { seconds } = z.object({ seconds: z.number().int().min(0).max(24 * 3600) }).parse(req.body);
  const { lesson } = await resolveLesson(req.user!.id, req.params.id as string);
  await query(
    `INSERT INTO user_progress (user_id, lesson_id, last_position_seconds, updated_at) VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, lesson_id) DO UPDATE SET last_position_seconds = EXCLUDED.last_position_seconds, updated_at = NOW()`,
    [req.user!.id, lesson.id, Math.min(seconds, lesson.durationSeconds * 4)],
  );
  res.json({ ok: true });
});

courseRouter.put('/lessons/:id/notes', async (req, res) => {
  const { content } = z.object({ content: z.string().max(20_000, 'Anotação muito longa (máx. 20.000 caracteres).') }).parse(req.body);
  const { lesson } = await resolveLesson(req.user!.id, req.params.id as string);
  const { rows } = await query(
    `INSERT INTO user_notes (user_id, lesson_id, content, updated_at) VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
     RETURNING content, updated_at`,
    [req.user!.id, lesson.id, content],
  );
  res.json(rows[0]);
});

courseRouter.get('/materials/:key', async (req, res) => {
  const material = materials[req.params.key as string];
  if (!material) throw new HttpError(404, 'Material não encontrado.');
  const course = await getCourse(req.user!.id);
  const mod = course.modules.find((m) => m.material?.key === material.key);
  if (mod?.locked) throw new HttpError(403, 'Conclua a sessão anterior para liberar este material.', 'MODULE_LOCKED');

  const pdf = await renderMaterial(material, req.user!.email);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${material.key}.pdf"`,
    'Cache-Control': 'private, no-store',
  });
  res.send(pdf);
});
