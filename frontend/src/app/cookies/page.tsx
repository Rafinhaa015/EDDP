import type { Metadata } from 'next';
import { CookieSettingsButton } from '@/components/CookieSettingsButton';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Gestão de Cookies' };

export default function CookiesPage() {
  return (
    <LegalPage title="Gestão de Cookies" updated="setembro de 2026">
      <p>Cookies são pequenos arquivos armazenados no seu navegador. Veja quais usamos e altere suas preferências quando quiser.</p>
      <div className="my-6">
        <CookieSettingsButton />
      </div>
      <h2>Essenciais (sempre ativos)</h2>
      <ul>
        <li><b>vs_session</b> — mantém você conectado (HttpOnly, inacessível a scripts).</li>
        <li><b>vs_csrf</b> — protege formulários contra requisições forjadas (CSRF).</li>
        <li><b>vs_cookie_consent</b> (armazenamento local) — guarda suas escolhas de cookies.</li>
      </ul>
      <h2>Desempenho e análise (opcionais)</h2>
      <p>Medem o uso da plataforma de forma agregada para melhorarmos as aulas. Só são ativados com seu consentimento.</p>
      <h2>Marketing (opcionais)</h2>
      <p>Personalizam comunicações sobre o curso. Só são ativados com seu consentimento.</p>
      <p>Sua escolha é registrada com data, hora, IP e navegador para fins de comprovação, conforme a LGPD.</p>
    </LegalPage>
  );
}
