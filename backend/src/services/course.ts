import { config } from '../config.js';
import { query } from '../db.js';

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationSeconds: number;
  orderIndex: number;
  completed: boolean;
  lastPositionSeconds: number;
}

export interface ModuleView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  orderIndex: number;
  material: { title: string; key: string } | null;
  lessons: LessonView[];
  totalLessons: number;
  completedLessons: number;
  durationSeconds: number;
  percent: number;
  status: ModuleStatus;
  locked: boolean;
}

export interface CourseView {
  modules: ModuleView[];
  totalLessons: number;
  completedLessons: number;
  percent: number;
  completed: boolean;
  nextLessonId: string | null;
  sequentialUnlock: boolean;
}

interface Row {
  module_id: string;
  module_slug: string;
  module_title: string;
  module_description: string | null;
  cover_image_url: string | null;
  module_order: number;
  material_title: string | null;
  material_key: string | null;
  lesson_id: string;
  lesson_slug: string;
  lesson_title: string;
  lesson_description: string | null;
  duration_seconds: number;
  lesson_order: number;
  completed: boolean | null;
  last_position_seconds: number | null;
}

const pct = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100));

/** Estrutura completa do curso com progresso, status e bloqueio de cada sessão para o usuário. */
export async function getCourse(userId: string): Promise<CourseView> {
  const { rows } = await query<Row>(
    `SELECT m.id AS module_id, m.slug AS module_slug, m.title AS module_title, m.description AS module_description,
            m.cover_image_url, m.order_index AS module_order, m.material_title, m.material_key,
            l.id AS lesson_id, l.slug AS lesson_slug, l.title AS lesson_title, l.description AS lesson_description,
            l.duration_seconds, l.order_index AS lesson_order,
            p.completed, p.last_position_seconds
       FROM modules m
       JOIN lessons l ON l.module_id = m.id
       LEFT JOIN user_progress p ON p.lesson_id = l.id AND p.user_id = $1
      ORDER BY m.order_index, l.order_index`,
    [userId],
  );

  const modules: ModuleView[] = [];
  for (const r of rows) {
    let mod = modules.find((m) => m.id === r.module_id);
    if (!mod) {
      mod = {
        id: r.module_id,
        slug: r.module_slug,
        title: r.module_title,
        description: r.module_description,
        coverImageUrl: r.cover_image_url,
        orderIndex: r.module_order,
        material: r.material_key ? { title: r.material_title ?? 'Material de apoio', key: r.material_key } : null,
        lessons: [],
        totalLessons: 0,
        completedLessons: 0,
        durationSeconds: 0,
        percent: 0,
        status: 'not_started',
        locked: false,
      };
      modules.push(mod);
    }
    mod.lessons.push({
      id: r.lesson_id,
      slug: r.lesson_slug,
      title: r.lesson_title,
      description: r.lesson_description,
      durationSeconds: r.duration_seconds,
      orderIndex: r.lesson_order,
      completed: Boolean(r.completed),
      lastPositionSeconds: r.last_position_seconds ?? 0,
    });
  }

  let previousComplete = true;
  for (const mod of modules) {
    mod.totalLessons = mod.lessons.length;
    mod.completedLessons = mod.lessons.filter((l) => l.completed).length;
    mod.durationSeconds = mod.lessons.reduce((s, l) => s + l.durationSeconds, 0);
    mod.percent = pct(mod.completedLessons, mod.totalLessons);
    const started = mod.completedLessons > 0 || mod.lessons.some((l) => l.lastPositionSeconds > 0);
    mod.status = mod.percent === 100 ? 'completed' : started ? 'in_progress' : 'not_started';
    mod.locked = config.sequentialUnlock && !previousComplete;
    previousComplete = mod.percent === 100;
  }

  const totalLessons = modules.reduce((s, m) => s + m.totalLessons, 0);
  const completedLessons = modules.reduce((s, m) => s + m.completedLessons, 0);
  const next =
    modules.filter((m) => !m.locked).flatMap((m) => m.lessons).find((l) => !l.completed) ?? null;

  return {
    modules,
    totalLessons,
    completedLessons,
    percent: pct(completedLessons, totalLessons),
    completed: totalLessons > 0 && completedLessons === totalLessons,
    nextLessonId: next?.id ?? null,
    sequentialUnlock: config.sequentialUnlock,
  };
}

export function findLesson(course: CourseView, lessonId: string) {
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId || l.slug === lessonId);
    if (lesson) return { module: mod, lesson };
  }
  return null;
}
