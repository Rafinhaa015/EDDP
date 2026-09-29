'use client';

import { ArrowRight, Award, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ModuleCard } from '@/components/ModuleCard';
import { ProgressBar, Spinner } from '@/components/ui';
import { useRequireAuth } from '@/lib/auth';
import { firstName, formatDuration } from '@/lib/format';

export default function DashboardPage() {
  const { user, course } = useRequireAuth();
  if (!user || !course) return <Spinner />;

  const lessons = course.modules.flatMap((m) => m.lessons);
  const next = lessons.find((l) => l.id === course.nextLessonId);
  const nextModule = course.modules.find((m) => m.lessons.some((l) => l.id === course.nextLessonId));
  const remaining = lessons.filter((l) => !l.completed).reduce((s, l) => s + l.durationSeconds, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Boas-vindas */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 p-6 sm:p-10">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-4xl">
              Olá, {firstName(user.name)}! {course.completed ? 'Parabéns pela conclusão! 🏆' : 'Pronto para a próxima aula?'}
            </h1>
            <p className="mt-2 text-slate-400">
              {course.completed
                ? 'Você concluiu 100% do curso. Seu certificado já está disponível.'
                : `Você concluiu ${course.completedLessons} de ${course.totalLessons} aulas · faltam ${formatDuration(remaining)} de conteúdo.`}
            </p>
            <div className="mt-6 max-w-md">
              <ProgressBar value={course.percent} label="Progresso geral" />
              <p className="mt-2 text-sm font-semibold text-white">{course.percent}% Concluído</p>
            </div>
          </div>
          {course.completed ? (
            <Link href="/perfil#certificado" className="flex items-center gap-3 rounded-2xl bg-brand-500 px-6 py-4 font-semibold text-ink-950 hover:bg-brand-400">
              <Award className="h-5 w-5" /> Emitir meu certificado
            </Link>
          ) : next ? (
            <Link href={`/aula/${next.slug}`} className="group flex max-w-sm items-center gap-4 rounded-2xl bg-brand-500 p-4 pr-6 text-ink-950 shadow-xl shadow-brand-500/20 hover:bg-brand-400">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-950/10"><Trophy className="h-6 w-6" /></span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase opacity-70">
                  {next.lastPositionSeconds > 0 ? 'Continuar assistindo' : 'Próxima aula'} · Sessão {nextModule?.orderIndex}
                </span>
                <span className="block truncate font-bold">{next.title}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
            </Link>
          ) : null}
        </div>
      </section>

      {/* Módulos */}
      <section id="modulos" className="scroll-mt-24 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold text-white">Módulos do curso</h2>
          {course.sequentialUnlock && <p className="text-sm text-slate-500">As sessões são liberadas em sequência ao concluir 100% da anterior.</p>}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {course.modules.map((m) => (
            <ModuleCard key={m.id} module={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
