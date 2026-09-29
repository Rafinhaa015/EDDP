import Link from 'next/link';
import { site } from '@/lib/site';

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lg)" />
      <path d="M9 26l7-7 5 5 10-11" fill="none" stroke="#070b14" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 13h6v6" fill="none" stroke="#070b14" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-extrabold tracking-tight text-white" aria-label={`${site.name} — início`}>
      <LogoMark />
      <span className="text-lg leading-none">
        Vendas <span className="text-brand-400">de Simples</span>
      </span>
    </Link>
  );
}
