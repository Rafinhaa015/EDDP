'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { firstName } from '@/lib/format';
import { ForgotForm, LoginForm, RegisterForm } from './AuthModals';
import { ProgressBar } from './ui';
import type { AuthModalView } from '@/lib/auth';

/** Formulário de Login/Cadastro embutido na seção Hero. */
export function HeroAuth() {
  const { user, course, loading } = useAuth();
  const [view, setView] = useState<AuthModalView>('register');

  if (loading) return <div className="h-[420px] animate-pulse rounded-3xl bg-white/5" />;

  if (user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-ink-850/80 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm font-medium text-brand-400">Bem-vindo(a) de volta</p>
        <h2 className="mt-1 text-2xl font-bold text-white">Olá, {firstName(user.name)}!</h2>
        {course && (
          <div className="mt-6 space-y-2">
            <ProgressBar value={course.percent} />
            <p className="text-sm text-slate-400">{course.percent}% do curso concluído</p>
          </div>
        )}
        <Link href="/dashboard" className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 font-semibold text-ink-950 hover:bg-brand-400">
          Ir para minhas aulas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-ink-850/80 p-6 shadow-2xl backdrop-blur sm:p-8">
      {view !== 'forgot' && (
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1" role="tablist">
          {(['register', 'login'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`h-10 rounded-lg text-sm font-semibold transition ${view === v ? 'bg-brand-500 text-ink-950' : 'text-slate-400 hover:text-white'}`}
            >
              {v === 'register' ? 'Cadastrar-se' : 'Entrar'}
            </button>
          ))}
        </div>
      )}
      {view === 'register' && <RegisterForm onSwitch={setView} />}
      {view === 'login' && <LoginForm onSwitch={setView} />}
      {view === 'forgot' && <ForgotForm onSwitch={setView} />}
    </div>
  );
}
