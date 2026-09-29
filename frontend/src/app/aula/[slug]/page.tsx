'use client';

import { ArrowLeft, ArrowRight, Check, CheckCircle2, Download, FileText, NotebookPen, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LessonPlaylist } from '@/components/LessonPlaylist';
import { Alert, Button, Spinner } from '@/components/ui';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ApiError, api, download } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { formatDuration } from '@/lib/format';
import type { Course, LessonDetail } from '@/lib/types';

type Tab = 'downloads' | 'notes';

function Notes({ lessonId, initial }: { lessonId: string; initial: string }) {
  const [content, setContent] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saved = useRef(initial);

  const save = useCallback(
    async (value: string) => {
      if (value === saved.current) return;
      setStatus('saving');
      try {
        await api(`/lessons/${lessonId}/notes`, { method: 'PUT', json: { content: value } });
        saved.current = value;
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    },
    [lessonId],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="space-y-2">
      <label htmlFor="notes" className="sr-only">Anotações pessoais</label>
      <textarea
        id="notes"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setStatus('idle');
          clearTimeout(timer.current);
          const v = e.target.value;
          timer.current = setTimeout(() => save(v), 1000);
        }}
        onBlur={() => save(content)}
        rows={8}
        maxLength={20000}
        placeholder="Escreva aqui seus insights, frases de impacto e ações para aplicar amanhã…"
        className="w-full resize-y rounded-xl border border-white/10 bg-ink-900 p-4 text-sm leading-relaxed text-white placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
      />
      <p className="text-xs text-slate-500" aria-live="polite">
        {status === 'saving' && 'Salvando…'}
        {status === 'saved' && '✓ Salvo no seu perfil'}
        {status === 'error' && <span className="text-red-400">Não foi possível salvar. Tente novamente.</span>}
        {status === 'idle' && 'Salvo automaticamente no seu perfil.'}
      </p>
    </div>
  );
}

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, course, setCourse } = useRequireAuth();
  const [data, setData] = useState<LessonDetail | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tab, setTab] = useState<Tab>('downloads');
  const [toggling, setToggling] = useState(false);
  const [ended, setEnded] = useState(false);
  const [dlError, setDlError] = useState('');
  const streamRetries = useRef(0);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await api<LessonDetail>(`/lessons/${slug}`));
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(500, 'Erro ao carregar a aula.'));
    }
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    setData(null);
    setEnded(false);
    streamRetries.current = 0;
    load();
  }, [user, load]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <Alert tone={error.code === 'MODULE_LOCKED' ? 'info' : 'error'}>{error.message}</Alert>
        <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar aos módulos
        </Link>
      </div>
    );
  }
  if (!user || !course || !data) return <Spinner label="Carregando aula…" />;

  const live = course.modules.flatMap((m) => m.lessons).find((l) => l.id === data.lesson.id);
  const completed = live?.completed ?? data.lesson.completed;

  async function setCompleted(value: boolean) {
    setToggling(true);
    try {
      const c = await api<Course>(`/lessons/${data!.lesson.id}/complete`, { method: 'POST', json: { completed: value } });
      setCourse(c);
      return c;
    } finally {
      setToggling(false);
    }
  }

  async function completeAndNext() {
    const c = await setCompleted(true);
    const nextLesson = data!.next;
    const nextModuleLocked = c?.modules.find((m) => m.lessons.some((l) => l.id === nextLesson?.id))?.locked;
    if (nextLesson && !nextModuleLocked) router.push(`/aula/${nextLesson.slug}`);
    else if (c?.completed) router.push('/perfil#certificado');
    else setEnded(false);
  }

  const tabBtn = (t: Tab, label: React.ReactNode, Icon: typeof Download) => (
    <button
      role="tab"
      aria-selected={tab === t}
      aria-controls={`tab-${t}`}
      onClick={() => setTab(t)}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition ${tab === t ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-8">
      {/* Coluna principal */}
      <div className="min-w-0 space-y-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Módulos
          </Link>
          <p className="mt-3 text-xs font-semibold tracking-wider text-brand-400 uppercase">
            Sessão {data.module.orderIndex} · {data.module.title}
          </p>
          <h1 className="mt-1 text-2xl leading-tight font-extrabold text-white sm:text-3xl">
            {data.module.orderIndex}.{data.lesson.orderIndex} {data.lesson.title}
          </h1>
        </div>

        <VideoPlayer
          key={data.lesson.id}
          src={data.stream.url}
          startAt={data.lesson.lastPositionSeconds}
          watermark={data.watermark}
          onProgress={(s) => api(`/lessons/${data.lesson.id}/position`, { method: 'PUT', json: { seconds: s } }).catch(() => undefined)}
          onEnded={() => setEnded(true)}
          onStreamError={() => {
            // Token do vídeo pode ter expirado: renova a URL assinada uma única vez.
            if (streamRetries.current++ < 1) load();
          }}
        >
          {ended && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/85 p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-brand-400" />
              <p className="text-lg font-bold text-white">Aula finalizada!</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={completeAndNext} loading={toggling}>
                  {data.next ? 'Concluir e ir para a próxima' : 'Concluir aula'} <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => setEnded(false)}>
                  <RotateCcw className="h-4 w-4" /> Rever
                </Button>
              </div>
            </div>
          )}
        </VideoPlayer>

        {data.stream.demo && (
          <p className="text-xs text-slate-500">Modo demonstração: configure o provedor de vídeo (Bunny.net/CloudFront) para exibir as aulas reais.</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={() => setCompleted(!completed)}
            loading={toggling}
            size="lg"
            variant={completed ? 'primary' : 'secondary'}
            className={completed ? '' : 'ring-brand-500/40'}
            aria-pressed={completed}
          >
            {completed ? <><CheckCircle2 className="h-5 w-5" /> Aula concluída</> : <><Check className="h-5 w-5" /> Marcar como Concluída</>}
          </Button>
          <div className="flex gap-2">
            {data.prev && (
              <Link href={`/aula/${data.prev.slug}`} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-slate-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Link>
            )}
            {data.next && (
              <Link href={`/aula/${data.next.slug}`} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-slate-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white">
                Próxima <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {data.lesson.description && <p className="leading-relaxed text-slate-300">{data.lesson.description}</p>}

        <section className="rounded-2xl border border-white/10 bg-ink-850 p-5 sm:p-6">
          <div role="tablist" className="mb-5 flex gap-6 border-b border-white/5">
            {tabBtn('downloads', 'Downloads', Download)}
            {tabBtn('notes', <>Anotações<span className="hidden sm:inline">&nbsp;pessoais</span></>, NotebookPen)}
          </div>
          <div id="tab-downloads" role="tabpanel" hidden={tab !== 'downloads'}>
            {dlError && <div className="mb-3"><Alert>{dlError}</Alert></div>}
            {data.downloads.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum arquivo anexado a esta aula.</p>
            ) : (
              <ul className="space-y-3">
                {data.downloads.map((d) => (
                  <li key={d.url}>
                    <button
                      onClick={() => {
                        setDlError('');
                        download(d.url.replace(/^\/api/, ''), 'material.pdf').catch((e) => setDlError(e.message));
                      }}
                      className="flex w-full items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition hover:border-brand-500/40 hover:bg-brand-500/5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-300"><FileText className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{d.title}</span>
                        <span className="text-xs text-slate-500">PDF · Material de apoio da Sessão {data.module.orderIndex}</span>
                      </span>
                      <Download className="h-5 w-5 shrink-0 text-brand-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div id="tab-notes" role="tabpanel" hidden={tab !== 'notes'}>
            <Notes key={data.lesson.id} lessonId={data.lesson.id} initial={data.note.content} />
          </div>
        </section>
      </div>

      {/* Playlist */}
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto">
        <LessonPlaylist course={course} currentId={data.lesson.id} />
        <p className="mt-3 px-1 text-xs text-slate-500">Duração desta aula: {formatDuration(data.lesson.durationSeconds)}</p>
      </aside>
    </div>
  );
}
