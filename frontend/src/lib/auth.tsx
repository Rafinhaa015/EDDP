'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Course, User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  course: Course | null;
  setUser: (u: User | null) => void;
  setCourse: (c: Course | null) => void;
  refreshCourse: () => Promise<Course | null>;
  logout: () => Promise<void>;
  authModal: AuthModalView | null;
  openAuth: (view: AuthModalView) => void;
  closeAuth: () => void;
}

export type AuthModalView = 'login' | 'register' | 'forgot';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState<AuthModalView | null>(null);

  useEffect(() => {
    api<{ user: User | null }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshCourse = useCallback(async () => {
    try {
      const c = await api<Course>('/course');
      setCourse(c);
      return c;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (user) refreshCourse();
    else setCourse(null);
  }, [user, refreshCourse]);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    // Recarrega a página inteira: descarta qualquer estado do aluno em memória.
    window.location.href = '/';
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      course,
      setUser,
      setCourse,
      refreshCourse,
      logout,
      authModal,
      openAuth: setAuthModal,
      closeAuth: () => setAuthModal(null),
    }),
    [user, loading, course, refreshCourse, logout, authModal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}

/** Redireciona para a landing page (abrindo o login) quando não há sessão. */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace(`/?login=1&next=${encodeURIComponent(pathname)}`);
    }
  }, [auth.loading, auth.user, router, pathname]);
  return auth;
}
