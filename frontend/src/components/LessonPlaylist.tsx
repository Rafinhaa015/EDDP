'use client';

import { CheckCircle2, ChevronDown, Circle, Lock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/format';
import type { Course } from '@/lib/types';

/** Playlist em acordeão com as 3 sessões e checklist das aulas concluídas. */
export function LessonPlaylist({ course, currentId }: { course: Course; currentId: string }) {
  const currentModule = course.modules.find((m) => m.lessons.some((l) => l.id === currentId));
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentModule) setOpen((o) => ({ ...o, [currentModule.id]: true }));
  }, [currentModule?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav aria-label="Aulas do curso" className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
      <div className="border-b border-white/5 p-5">
        <h2 className="font-bold text-white">Conteúdo do curso</h2>
        <p className="mt-1 text-xs text-slate-400">
          {course.completedLessons}/{course.totalLessons} aulas concluídas · {course.percent}%
        </p>
      </div>
      {course.modules.map((m) => {
        const isOpen = open[m.id] ?? false;
        const panelId = `playlist-${m.id}`;
        return (
          <div key={m.id} className="border-b border-white/5 last:border-0">
            <button
              onClick={() => setOpen((o) => ({ ...o, [m.id]: !isOpen }))}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.03]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold tracking-wider text-brand-400 uppercase">Sessão {m.orderIndex}</span>
                <span className="mt-0.5 block text-sm font-semibold text-white">{m.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {m.completedLessons}/{m.totalLessons} · {formatDuration(m.durationSeconds)}
                </span>
              </span>
              {m.locked ? <Lock className="h-4 w-4 shrink-0 text-slate-500" aria-label="Bloqueada" /> : m.percent === 100 ? <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-400" aria-label="Concluída" /> : null}
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <ul id={panelId} className="pb-2">
                {m.lessons.map((l) => {
                  const active = l.id === currentId;
                  const icon = l.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-brand-400" aria-label="Concluída" />
                  ) : active ? (
                    <PlayCircle className="h-5 w-5 text-white" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-600" aria-hidden />
                  );
                  const inner = (
                    <>
                      <span className="mt-0.5 shrink-0">{m.locked ? <Lock className="h-4 w-4 text-slate-600" /> : icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm leading-snug ${active ? 'font-semibold text-white' : 'text-slate-300'}`}>
                          {m.orderIndex}.{l.orderIndex} {l.title}
                        </span>
                        <span className="text-xs text-slate-500">{formatDuration(l.durationSeconds)}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={l.id}>
                      {m.locked ? (
                        <div className="flex cursor-not-allowed gap-3 px-5 py-2.5 opacity-50">{inner}</div>
                      ) : (
                        <Link
                          href={`/aula/${l.slug}`}
                          aria-current={active ? 'page' : undefined}
                          className={`flex gap-3 border-l-2 px-5 py-2.5 transition ${active ? 'border-brand-500 bg-brand-500/10' : 'border-transparent hover:bg-white/[0.03]'}`}
                        >
                          {inner}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
