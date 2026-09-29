import { CheckCircle2, Clock, Lock, PlayCircle, PlayIcon } from 'lucide-react';
import Link from 'next/link';
import { formatDuration } from '@/lib/format';
import type { CourseModule } from '@/lib/types';
import { ProgressBar } from './ui';

const statusLabel = {
  not_started: { text: 'Não iniciado', cls: 'bg-white/10 text-slate-300' },
  in_progress: { text: 'Em andamento', cls: 'bg-amber-500/15 text-amber-300' },
  completed: { text: 'Concluído', cls: 'bg-brand-500/15 text-brand-300' },
};

export function ModuleCard({ module: m }: { module: CourseModule }) {
  const next = m.lessons.find((l) => !l.completed) ?? m.lessons[0];
  const status = statusLabel[m.status];

  const body = (
    <>
      <div className="relative">
        <img src={m.coverImageUrl ?? '/covers/mentalidade.svg'} alt="" className={`aspect-[16/9] w-full object-cover ${m.locked ? 'opacity-40 grayscale' : ''}`} />
        <span className="absolute top-3 left-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">Sessão {m.orderIndex}</span>
        {m.locked && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm font-medium text-slate-200">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-950/80 backdrop-blur"><Lock className="h-5 w-5" /></span>
            Conclua a Sessão {m.orderIndex - 1} para liberar
          </span>
        )}
        {!m.locked && (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-ink-950 shadow-xl"><PlayIcon className="ml-0.5 h-6 w-6" fill="currentColor" /></span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.locked ? 'bg-white/5 text-slate-400' : status.cls}`}>
            {m.locked ? 'Bloqueado' : status.text}
          </span>
          {m.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-brand-400" aria-hidden />}
        </div>
        <h3 className="text-lg leading-snug font-bold text-white">{m.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-400">{m.description}</p>
        <div className="mt-auto flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><PlayCircle className="h-4 w-4" /> {m.totalLessons} aulas</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDuration(m.durationSeconds)}</span>
        </div>
        <div className="space-y-1.5">
          <ProgressBar value={m.percent} label={`Progresso da sessão ${m.orderIndex}`} />
          <p className="text-xs text-slate-500">{m.completedLessons} de {m.totalLessons} aulas concluídas · {m.percent}%</p>
        </div>
      </div>
    </>
  );

  const cls = 'group card-3d flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-850';
  if (m.locked) {
    return <div className={`${cls} cursor-not-allowed`} aria-disabled="true">{body}</div>;
  }
  return (
    <Link href={`/aula/${next.slug}`} className={cls} aria-label={`${m.title} — ${status.text}`}>
      {body}
    </Link>
  );
}
