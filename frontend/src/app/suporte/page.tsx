import { Clock, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { WhatsAppIcon } from '@/components/WhatsAppWidget';
import { site, whatsappLink } from '@/lib/site';

export const metadata: Metadata = { title: 'Suporte' };

const faq = [
  { q: 'Esqueci minha senha. E agora?', a: 'Clique em Entrar › "Esqueci minha senha". Você receberá um link por e-mail válido por 15 minutos.' },
  { q: 'Por que a Sessão 2 está bloqueada?', a: 'As sessões são liberadas em sequência: conclua 100% das aulas da sessão anterior clicando em "Marcar como Concluída".' },
  { q: 'Como emito meu certificado?', a: 'Ao concluir todas as aulas, o certificado é liberado automaticamente em Perfil › Certificado.' },
  { q: 'Onde ficam os PDFs?', a: 'Na sala de aula, aba "Downloads", abaixo do player.' },
  { q: 'O vídeo não carrega.', a: 'Atualize a página. Se persistir, teste outra rede ou navegador e fale com a gente pelo WhatsApp.' },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Suporte</h1>
      <p className="mt-2 text-slate-400">Estamos aqui para você não travar em nenhuma etapa.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 bg-ink-850 p-6 transition hover:border-[#25D366]/50">
          <WhatsAppIcon className="h-7 w-7 text-[#25D366]" />
          <p className="mt-4 font-semibold text-white">WhatsApp</p>
          <p className="text-sm text-slate-400">{site.whatsappDisplay}</p>
        </a>
        <a href={`mailto:${site.supportEmail}`} className="rounded-2xl border border-white/10 bg-ink-850 p-6 transition hover:border-brand-500/50">
          <Mail className="h-7 w-7 text-brand-400" />
          <p className="mt-4 font-semibold text-white">E-mail</p>
          <p className="text-sm break-all text-slate-400">{site.supportEmail}</p>
        </a>
        <div className="rounded-2xl border border-white/10 bg-ink-850 p-6">
          <Clock className="h-7 w-7 text-brand-400" />
          <p className="mt-4 font-semibold text-white">Horário</p>
          <p className="text-sm text-slate-400">{site.supportHours}</p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-bold text-white">Perguntas frequentes</h2>
      <div className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-ink-850">
        {faq.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="cursor-pointer list-none font-semibold text-white marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {f.q}
                <span className="text-brand-400 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-slate-400">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
