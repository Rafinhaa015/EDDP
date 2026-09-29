import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Termos de Uso' };

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso" updated="setembro de 2026">
      <p>Ao criar uma conta na plataforma {site.name} (CNPJ {site.cnpj}), você concorda com estes Termos de Uso. Leia com atenção.</p>
      <h2>1. Objeto</h2>
      <p>A plataforma oferece acesso a um curso online de vendas composto por videoaulas, materiais de apoio em PDF e certificado de conclusão.</p>
      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>Você deve fornecer informações verdadeiras e mantê-las atualizadas.</li>
        <li>O acesso é pessoal e intransferível. É proibido compartilhar login e senha.</li>
        <li>Você é responsável por manter sua senha em sigilo.</li>
      </ul>
      <h2>3. Propriedade intelectual e uso do conteúdo</h2>
      <p>Todo o conteúdo (vídeos, textos, PDFs, marcas) é protegido pela Lei nº 9.610/98. É proibido gravar, baixar, copiar, redistribuir ou comercializar o conteúdo. Os materiais podem conter marca d&apos;água com a identificação do aluno para coibir a pirataria.</p>
      <h2>4. Certificado</h2>
      <p>O certificado de conclusão é liberado automaticamente após a conclusão de 100% das aulas e possui código público de validação.</p>
      <h2>5. Suspensão e encerramento</h2>
      <p>Contas que violarem estes termos poderão ser suspensas. Você pode excluir sua conta a qualquer momento em Perfil › Privacidade e LGPD.</p>
      <h2>6. Privacidade</h2>
      <p>O tratamento de dados pessoais segue a nossa <Link href="/privacidade" className="text-brand-400 underline">Política de Privacidade</Link>.</p>
      <h2>7. Contato</h2>
      <p>Dúvidas: {site.supportEmail} · WhatsApp {site.whatsappDisplay}.</p>
    </LegalPage>
  );
}
