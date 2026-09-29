import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { AuthModals } from '@/components/AuthModals';
import { CookieBanner } from '@/components/CookieBanner';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';
import { AuthProvider } from '@/lib/auth';
import { site } from '@/lib/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `${site.name} — Treinamento prático de vendas`, template: `%s · ${site.name}` },
  description: site.tagline,
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#070b14' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="flex min-h-dvh flex-col font-sans">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-ink-950">
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <Header />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <Footer />
          <Suspense>
            <AuthModals />
          </Suspense>
          <CookieBanner />
          <WhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
