'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, api } from '@/lib/api';
import { useAuth, type AuthModalView } from '@/lib/auth';
import type { User } from '@/lib/types';
import { Modal } from './Modal';
import { Alert, Button, Field } from './ui';

function useSafeNext() {
  const params = useSearchParams();
  const next = params.get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export function LoginForm({ onSwitch }: { onSwitch?: (v: AuthModalView) => void }) {
  const { setUser, closeAuth } = useAuth();
  const router = useRouter();
  const next = useSafeNext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await api<{ user: User }>('/auth/login', { method: 'POST', json: { email, password } });
      setUser(user);
      closeAuth();
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && <Alert>{error}</Alert>}
      <Field label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
      <Field label="Senha" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="flex justify-end">
        <button type="button" onClick={() => onSwitch?.('forgot')} className="text-sm font-medium text-brand-400 hover:underline">
          Esqueci minha senha
        </button>
      </div>
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Entrar
      </Button>
      <p className="text-center text-sm text-slate-400">
        Ainda não tem conta?{' '}
        <button type="button" onClick={() => onSwitch?.('register')} className="font-semibold text-brand-400 hover:underline">
          Cadastre-se grátis
        </button>
      </p>
    </form>
  );
}

function maskPhone(raw: string) {
  let digits = raw.replace(/\D/g, '').slice(0, 15);
  if (!digits) return '';
  // Sem "+" digitado: assume Brasil (DDI 55) quando parece um número nacional.
  if (!raw.trim().startsWith('+') && !digits.startsWith('55') && digits.length <= 11) digits = `55${digits}`;
  if (digits.startsWith('55')) {
    const d = digits.slice(2);
    let out = '+55';
    if (d.length) out += ` (${d.slice(0, 2)}`;
    if (d.length >= 2) out += ')';
    if (d.length > 2) out += ` ${d.slice(2, d.length > 10 ? 7 : 6)}`;
    if (d.length > 6) out += `-${d.slice(d.length > 10 ? 7 : 6, 11)}`;
    return out;
  }
  return `+${digits}`;
}

export function RegisterForm({ onSwitch }: { onSwitch?: (v: AuthModalView) => void }) {
  const { setUser, closeAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '+55 ', password: '', confirmPassword: '', acceptTerms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = k === 'acceptTerms' ? e.target.checked : k === 'phone' ? maskPhone(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  function validate() {
    const er: Record<string, string> = {};
    if (form.name.trim().split(/\s+/).length < 2) er.name = 'Informe nome e sobrenome.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'E-mail inválido.';
    if (form.phone.replace(/\D/g, '').length < 10) er.phone = 'Informe DDI + DDD + número.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      er.password = 'Mínimo de 8 caracteres, com letras e números.';
    if (form.password !== form.confirmPassword) er.confirmPassword = 'As senhas não conferem.';
    if (!form.acceptTerms) er.acceptTerms = 'Você precisa concordar para continuar.';
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await api<{ user: User }>('/auth/register', { method: 'POST', json: form });
      setUser(user);
      closeAuth();
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.field) setErrors({ [err.field]: err.message });
      else setError(err instanceof ApiError ? err.message : 'Falha no cadastro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && <Alert>{error}</Alert>}
      <Field label="Nome completo" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Maria da Silva" />
      <Field label="E-mail" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="voce@email.com" />
      <Field label="Telefone (com DDI/DDD)" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+55 (11) 91234-5678" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Senha" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="8+ caracteres, letras e números" />
        <Field label="Confirmar senha" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-300">
          <input type="checkbox" checked={form.acceptTerms} onChange={set('acceptTerms')} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500" aria-invalid={Boolean(errors.acceptTerms)} />
          <span>
            Concordo com os{' '}
            <Link href="/termos" target="_blank" className="font-semibold text-brand-400 hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacidade" target="_blank" className="font-semibold text-brand-400 hover:underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms && <p className="mt-1 text-xs text-red-400">{errors.acceptTerms}</p>}
      </div>
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Criar minha conta
      </Button>
      <p className="text-center text-sm text-slate-400">
        Já tem conta?{' '}
        <button type="button" onClick={() => onSwitch?.('login')} className="font-semibold text-brand-400 hover:underline">
          Entrar
        </button>
      </p>
    </form>
  );
}

export function ForgotForm({ onSwitch }: { onSwitch?: (v: AuthModalView) => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api<{ message: string }>('/auth/forgot-password', { method: 'POST', json: { email } });
      setMessage(r.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao enviar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-sm text-slate-400">Informe seu e-mail. Enviaremos um link para criar uma nova senha, válido por 15 minutos.</p>
      {error && <Alert>{error}</Alert>}
      {message ? (
        <Alert tone="success">{message}</Alert>
      ) : (
        <>
          <Field label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Enviar link de recuperação
          </Button>
        </>
      )}
      <p className="text-center text-sm">
        <button type="button" onClick={() => onSwitch?.('login')} className="font-semibold text-brand-400 hover:underline">
          Voltar para o login
        </button>
      </p>
    </form>
  );
}

const titles: Record<AuthModalView, string> = {
  login: 'Entrar na plataforma',
  register: 'Crie sua conta',
  forgot: 'Esqueci minha senha',
};

export function AuthModals() {
  const { authModal, openAuth, closeAuth, user } = useAuth();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('login') === '1' && !user) openAuth('login');
    if (params.get('cadastro') === '1' && !user) openAuth('register');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (!authModal) return null;
  return (
    <Modal open onClose={closeAuth} title={titles[authModal]}>
      {authModal === 'login' && <LoginForm onSwitch={openAuth} />}
      {authModal === 'register' && <RegisterForm onSwitch={openAuth} />}
      {authModal === 'forgot' && <ForgotForm onSwitch={openAuth} />}
    </Modal>
  );
}
