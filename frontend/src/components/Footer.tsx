import { Clock, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { site, whatsappLink } from '@/lib/site';
import { Logo } from './Logo';

const col = 'text-sm font-semibold uppercase tracking-wider text-white';
const link = 'text-sm text-slate-400 transition hover:text-brand-400';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-slate-400">{site.tagline}</p>
        </div>

        <nav aria-label="Links rápidos" className="space-y-4">
          <h2 className={col}>Links rápidos</h2>
          <ul className="space-y-2.5">
            <li><Link className={link} href="/">Início</Link></li>
            <li><Link className={link} href="/dashboard#modulos">Módulos do Curso</Link></li>
            <li><Link className={link} href="/perfil#certificado">Meus Certificados</Link></li>
            <li><Link className={link} href="/suporte">Suporte</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal e privacidade" className="space-y-4">
          <h2 className={col}>Legal &amp; Privacidade</h2>
          <ul className="space-y-2.5">
            <li><Link className={link} href="/termos">Termos de Uso</Link></li>
            <li><Link className={link} href="/privacidade">Política de Privacidade</Link></li>
            <li><Link className={link} href="/cookies">Gestão de Cookies</Link></li>
            <li><Link className={link} href="/lgpd">Conformidade LGPD</Link></li>
          </ul>
        </nav>

        <div className="space-y-4">
          <h2 className={col}>Atendimento &amp; Contato</h2>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <a className={`${link} flex items-center gap-2`} href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 text-brand-400" /> WhatsApp: {site.whatsappDisplay}
              </a>
            </li>
            <li>
              <a className={`${link} flex items-center gap-2`} href={`mailto:${site.supportEmail}`}>
                <Mail className="h-4 w-4 text-brand-400" /> {site.supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> {site.supportHours}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados. CNPJ: {site.cnpj}.
        </p>
      </div>
    </footer>
  );
}
