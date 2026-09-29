'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { OPEN_COOKIE_SETTINGS, readConsent, writeConsent, type CookieConsent } from '@/lib/consent';
import { Modal } from './Modal';
import { Button } from './ui';

function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${checked ? 'bg-brand-500' : 'bg-white/15'}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const saved = readConsent();
    if (!saved) setVisible(true);
    else setPrefs({ analytics: saved.analytics, marketing: saved.marketing });
    const open = () => {
      const current = readConsent();
      if (current) setPrefs({ analytics: current.analytics, marketing: current.marketing });
      setCustomize(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, open);
  }, []);

  function save(choice: CookieConsent['choice'], p = prefs) {
    const consent: CookieConsent = { choice, ...p, date: new Date().toISOString() };
    writeConsent(consent);
    api('/consents/cookies', { method: 'POST', json: { choice, preferences: p } }).catch(() => undefined);
    setVisible(false);
    setCustomize(false);
  }

  return (
    <>
      {visible && !customize && (
        <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-0 bottom-0 z-[65] animate-pop p-3 sm:p-5">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-white/10 bg-ink-850/95 p-5 shadow-2xl backdrop-blur-xl md:flex-row md:items-center">
            <Cookie className="hidden h-8 w-8 shrink-0 text-brand-400 md:block" aria-hidden />
            <p className="flex-1 text-sm leading-relaxed text-slate-300">
              Usamos cookies essenciais para manter você conectado e, com sua permissão, cookies de desempenho e marketing para melhorar sua experiência.
              Saiba mais na <Link href="/cookies" className="font-semibold text-brand-400 hover:underline">Política de Cookies</Link>.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="ghost" size="sm" onClick={() => save('reject', { analytics: false, marketing: false })}>
                Rejeitar
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCustomize(true)}>
                Personalizar
              </Button>
              <Button size="sm" onClick={() => save('accept_all', { analytics: true, marketing: true })}>
                Permitir todos
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal open={customize} onClose={() => setCustomize(false)} title="Preferências de cookies">
        <div className="space-y-5">
          {[
            { key: 'necessary', title: 'Essenciais', desc: 'Sessão de login, segurança (CSRF) e preferências. Sempre ativos.', locked: true },
            { key: 'analytics', title: 'Desempenho e análise', desc: 'Nos ajudam a entender o uso da plataforma para melhorar as aulas.' },
            { key: 'marketing', title: 'Marketing', desc: 'Personalizam comunicações e ofertas relacionadas ao curso.' },
          ].map((c) => (
            <div key={c.key} className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="font-semibold text-white">{c.title}</p>
                <p className="mt-1 text-sm text-slate-400">{c.desc}</p>
              </div>
              <Toggle
                label={c.title}
                checked={c.locked ? true : prefs[c.key as 'analytics' | 'marketing']}
                disabled={c.locked}
                onChange={(v) => setPrefs((p) => ({ ...p, [c.key]: v }))}
              />
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => save('reject', { analytics: false, marketing: false })}>
              Rejeitar opcionais
            </Button>
            <Button onClick={() => save('custom')}>Salvar preferências</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
