'use client';

import { ChevronDown, LogOut, Settings, Award, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { firstName, initials } from '@/lib/format';
import { Logo } from './Logo';
import { Button, ProgressBar } from './ui';

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;
  const item = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-white/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-ink-950">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-white sm:block">{firstName(user.name)}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 animate-pop rounded-2xl border border-white/10 bg-ink-850 p-2 shadow-2xl">
          <div className="border-b border-white/5 px-3 pt-2 pb-3">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard" role="menuitem" className={item} onClick={() => setOpen(false)}>
              <LayoutGrid className="h-4 w-4" /> Meus módulos
            </Link>
            <Link href="/perfil" role="menuitem" className={item} onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4" /> Configurações da conta
            </Link>
            <Link href="/perfil#certificado" role="menuitem" className={item} onClick={() => setOpen(false)}>
              <Award className="h-4 w-4" /> Meu certificado
            </Link>
            <button role="menuitem" className={`${item} text-red-300 hover:text-red-200`} onClick={logout}>
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { user, loading, course, openAuth } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href={user ? '/dashboard' : '/'} />

        {user && course && (
          <Link href="/dashboard" className="hidden min-w-0 flex-1 items-center gap-3 md:flex md:max-w-sm" title="Seu progresso geral">
            <ProgressBar value={course.percent} label="Progresso geral do curso" className="flex-1" />
            <span className="shrink-0 text-sm font-semibold text-white">
              {course.percent}% <span className="font-normal text-slate-400">Concluído</span>
            </span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-white/5" />
          ) : user ? (
            <UserMenu />
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAuth('login')}>
                Entrar
              </Button>
              <Button size="sm" onClick={() => openAuth('register')}>
                Cadastrar-se
              </Button>
            </>
          )}
        </div>
      </div>
      {user && course && (
        <div className="px-4 pb-2 md:hidden">
          <div className="flex items-center gap-3">
            <ProgressBar value={course.percent} label="Progresso geral do curso" className="flex-1" />
            <span className="text-xs font-semibold text-white">{course.percent}% Concluído</span>
          </div>
        </div>
      )}
    </header>
  );
}
