'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Alert, Button, Field } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

function ResetForm() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const { setUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('As senhas não conferem.');
    setLoading(true);
    try {
      await api('/auth/reset-password', { method: 'POST', json: { token, password, confirmPassword } });
      const me = await api<{ user: User | null }>('/auth/me');
      setUser(me.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao redefinir a senha.');
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Alert>
        Link inválido. Solicite uma nova redefinição em <Link href="/?login=1" className="underline">Entrar › Esqueci minha senha</Link>.
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Field label="Nova senha" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="8+ caracteres, letras e números" />
      <Field label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      <Button type="submit" loading={loading} size="lg" className="w-full">Salvar nova senha</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-white/10 bg-ink-850 p-8">
        <h1 className="text-2xl font-bold text-white">Criar nova senha</h1>
        <p className="mt-1 mb-6 text-sm text-slate-400">O link de redefinição expira 15 minutos após a solicitação.</p>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
