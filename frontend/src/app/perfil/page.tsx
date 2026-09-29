'use client';

import { Award, Download, Lock, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Alert, Button, Field, ProgressBar, Spinner } from '@/components/ui';
import { ApiError, api, download } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

function Card({ id, icon: Icon, title, desc, children }: { id?: string; icon: typeof UserRound; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-white/10 bg-ink-850 p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400"><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {desc && <p className="mt-1 text-sm text-slate-400">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ProfileForm({ user, onSaved }: { user: User; onSaved: (u: User) => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const r = await api<{ user: User }>('/profile', { method: 'PATCH', json: { name, phone } });
      onSaved(r.user);
      setPhone(r.user.phone ?? '');
      setMsg({ tone: 'success', text: 'Dados atualizados com sucesso.' });
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof ApiError ? err.message : 'Falha ao salvar.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <Field label="Telefone (com DDI/DDD)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      </div>
      <Field label="E-mail" value={user.email} disabled hint="Para alterar o e-mail, fale com o suporte." />
      <Button type="submit" loading={loading}>Salvar alterações</Button>
    </form>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword !== form.confirmPassword) return setMsg({ tone: 'error', text: 'As senhas não conferem.' });
    setLoading(true);
    try {
      await api('/profile/password', { method: 'POST', json: form });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({ tone: 'success', text: 'Senha alterada. Outras sessões abertas foram encerradas.' });
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof ApiError ? err.message : 'Falha ao alterar senha.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Field label="Senha atual" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nova senha" type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} hint="8+ caracteres, letras e números" />
        <Field label="Confirmar nova senha" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} />
      </div>
      <Button type="submit" loading={loading} variant="secondary">Alterar senha</Button>
    </form>
  );
}

function Certificate({ percent }: { percent: number }) {
  const [cert, setCert] = useState<{ eligible: boolean; certificate: { code: string; issuedAt: string } | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<typeof cert>('/certificate').then(setCert).catch(() => undefined);
  }, [percent]);

  if (!cert) return <div className="h-24 animate-pulse rounded-xl bg-white/5" />;
  if (!cert.eligible) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-slate-300"><Lock className="h-4 w-4 text-slate-500" /> Liberado automaticamente ao concluir 100% do curso.</div>
        <ProgressBar value={percent} />
        <p className="text-sm text-slate-500">Você está em {percent}%.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-brand-500/30 bg-brand-500/5 p-5 sm:flex-row sm:items-center">
      <Award className="h-12 w-12 shrink-0 text-brand-400" />
      <div className="flex-1">
        <p className="font-bold text-white">Certificado de Conclusão disponível! 🎉</p>
        <p className="mt-1 text-sm text-slate-400">
          Código de validação: <span className="font-mono text-brand-300">{cert.certificate?.code}</span> · emitido em{' '}
          {cert.certificate && new Date(cert.certificate.issuedAt).toLocaleDateString('pt-BR')}
        </p>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
      <Button
        loading={loading}
        onClick={async () => {
          setLoading(true);
          setError('');
          await download('/certificate/pdf', 'certificado.pdf').catch((e) => setError(e.message));
          setLoading(false);
        }}
      >
        <Download className="h-4 w-4" /> Baixar PDF
      </Button>
    </div>
  );
}

function DeleteAccount() {
  const { setUser } = useRequireAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/profile', { method: 'DELETE', json: { password, confirmation } });
      setUser(null);
      window.location.href = '/?conta=excluida';
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao excluir conta.');
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" /> Excluir minha conta permanentemente
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Excluir conta permanentemente">
        <form onSubmit={submit} className="space-y-4">
          <Alert>
            Esta ação é <b>irreversível</b>. Seus dados cadastrais, progresso, anotações, consentimentos e certificado serão apagados.
          </Alert>
          {error && <Alert>{error}</Alert>}
          <Field label="Sua senha" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Field label='Digite "EXCLUIR" para confirmar' value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="danger" loading={loading} disabled={confirmation !== 'EXCLUIR' || !password}>Excluir definitivamente</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function ProfilePage() {
  const { user, course, setUser } = useRequireAuth();
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user && window.location.hash) {
      setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [user]);

  if (!user) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Perfil e configurações</h1>
        <p className="mt-1 text-slate-400">Gerencie seus dados, senha, certificado e privacidade.</p>
      </div>

      <Card icon={UserRound} title="Dados pessoais">
        <ProfileForm user={user} onSaved={setUser} />
      </Card>

      <Card icon={Lock} title="Alterar senha">
        <PasswordForm />
      </Card>

      <Card id="certificado" icon={Award} title="Certificado" desc="Emitido automaticamente após 100% de conclusão.">
        <Certificate percent={course?.percent ?? 0} />
      </Card>

      <Card id="lgpd" icon={ShieldCheck} title="Privacidade e LGPD" desc="Exerça seus direitos de titular de dados (Lei nº 13.709/2018, art. 18).">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">Baixar meus dados cadastrais</p>
              <p className="text-sm text-slate-400">Arquivo JSON com cadastro, progresso, anotações e registros de consentimento.</p>
            </div>
            <Button
              variant="secondary"
              loading={exporting}
              onClick={async () => {
                setExporting(true);
                setExportError('');
                await download('/profile/export', 'meus-dados.json').catch((e) => setExportError(e.message));
                setExporting(false);
              }}
            >
              <Download className="h-4 w-4" /> Baixar meus dados
            </Button>
          </div>
          {exportError && <Alert>{exportError}</Alert>}
          <div className="border-t border-white/5 pt-6">
            <p className="font-semibold text-white">Excluir minha conta</p>
            <p className="mb-4 text-sm text-slate-400">Remove permanentemente todos os seus dados da plataforma.</p>
            <DeleteAccount />
          </div>
        </div>
      </Card>
    </div>
  );
}
