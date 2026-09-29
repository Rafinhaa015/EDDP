import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Política de Privacidade' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade" updated="setembro de 2026">
      <p>Esta política descreve como {site.name} (controlador, CNPJ {site.cnpj}) trata seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
      <h2>1. Dados que coletamos</h2>
      <ul>
        <li><b>Cadastro:</b> nome completo, e-mail, telefone e senha (armazenada apenas como hash bcrypt).</li>
        <li><b>Uso da plataforma:</b> aulas concluídas, posição do vídeo e anotações pessoais.</li>
        <li><b>Registros de consentimento:</b> data/hora, endereço IP e navegador (User-Agent) no aceite dos termos e na escolha de cookies.</li>
      </ul>
      <h2>2. Finalidades e bases legais</h2>
      <ul>
        <li>Prestar o serviço contratado e emitir o certificado — execução de contrato (art. 7º, V).</li>
        <li>Segurança da conta e prevenção a fraudes — legítimo interesse (art. 7º, IX).</li>
        <li>Comprovar o aceite dos termos — cumprimento de obrigação legal e exercício regular de direitos (art. 7º, II e VI).</li>
        <li>Cookies não essenciais — consentimento (art. 7º, I).</li>
      </ul>
      <h2>3. Compartilhamento</h2>
      <p>Compartilhamos dados apenas com operadores necessários ao serviço (hospedagem, banco de dados, entrega de vídeos e envio de e-mails transacionais), sob contrato e com as mesmas garantias de proteção. Não vendemos dados pessoais.</p>
      <h2>4. Segurança</h2>
      <p>Utilizamos HTTPS, senhas com hash bcrypt, sessões em cookies HttpOnly com proteção CSRF, limite de tentativas de login e vídeos entregues por links temporários.</p>
      <h2>5. Retenção</h2>
      <p>Mantemos seus dados enquanto a conta estiver ativa. Ao excluir a conta, os dados são apagados, salvo quando a lei exigir sua guarda.</p>
      <h2>6. Seus direitos</h2>
      <p>Você pode, a qualquer momento: confirmar e acessar seus dados, corrigi-los, solicitar portabilidade (botão &quot;Baixar meus dados&quot;), revogar consentimentos e solicitar a eliminação (botão &quot;Excluir minha conta&quot;) na área Perfil.</p>
      <h2>7. Encarregado (DPO)</h2>
      <p>Contato do encarregado pelo tratamento de dados: {site.supportEmail}.</p>
    </LegalPage>
  );
}
