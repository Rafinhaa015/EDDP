'use client';

import { BadgeCheck, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui';
import { api } from '@/lib/api';

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const [state, setState] = useState<{ name: string; issuedAt: string; course: string } | 'invalid' | null>(null);

  useEffect(() => {
    api<{ name: string; issuedAt: string; course: string }>(`/certificate/verify/${encodeURIComponent(code)}`)
      .then(setState)
      .catch(() => setState('invalid'));
  }, [code]);

  if (!state) return <Spinner label="Validando certificado…" />;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {state === 'invalid' ? (
        <>
          <XCircle className="mx-auto h-14 w-14 text-red-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">Certificado não encontrado</h1>
          <p className="mt-2 text-slate-400">Verifique o código <span className="font-mono">{code}</span> e tente novamente.</p>
        </>
      ) : (
        <>
          <BadgeCheck className="mx-auto h-14 w-14 text-brand-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">Certificado válido</h1>
          <p className="mt-3 text-slate-300">
            <b className="text-white">{state.name}</b> concluiu o curso <b className="text-white">{state.course}</b> em{' '}
            {new Date(state.issuedAt).toLocaleDateString('pt-BR')}.
          </p>
          <p className="mt-2 font-mono text-sm text-slate-500">{code}</p>
        </>
      )}
    </div>
  );
}
