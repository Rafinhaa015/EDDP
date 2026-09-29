import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Conformidade LGPD' };

export default function LgpdPage() {
  return (
    <LegalPage title="Conformidade com a LGPD">
      <p>A proteção dos seus dados é parte do produto. Veja como a plataforma atende à Lei Geral de Proteção de Dados.</p>
      <h2>Consentimento explícito</h2>
      <ul>
        <li>Aceite obrigatório dos Termos de Uso e da Política de Privacidade no cadastro, registrado com data/hora, IP e navegador.</li>
        <li>Banner de cookies na primeira visita com as opções Permitir todos, Personalizar e Rejeitar.</li>
      </ul>
      <h2>Direitos do titular em autoatendimento</h2>
      <ul>
        <li><b>Acesso e portabilidade:</b> baixe seus dados em <Link href="/perfil#lgpd" className="text-brand-400 underline">Perfil › Privacidade e LGPD</Link>.</li>
        <li><b>Correção:</b> edite nome e telefone no seu perfil.</li>
        <li><b>Eliminação:</b> exclua sua conta permanentemente com um clique (confirmação por senha).</li>
        <li><b>Revogação:</b> altere o consentimento de cookies em <Link href="/cookies" className="text-brand-400 underline">Gestão de Cookies</Link>.</li>
      </ul>
      <h2>Segurança da informação</h2>
      <ul>
        <li>Senhas com hash bcrypt (fator de custo ≥ 10).</li>
        <li>Sessão via JWT em cookie HttpOnly, com proteção contra XSS e CSRF.</li>
        <li>Limite de 5 tentativas de login incorretas por minuto por IP.</li>
        <li>Vídeos via streaming HLS com links temporários e marca d&apos;água com o e-mail do aluno.</li>
      </ul>
      <h2>Contato do encarregado</h2>
      <p>{site.supportEmail}</p>
    </LegalPage>
  );
}
