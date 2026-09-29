/**
 * Conteúdo dos materiais de apoio (PDF) de cada sessão.
 * Os PDFs são gerados sob demanda e servidos apenas para alunos autenticados.
 */
export interface MaterialSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  checklist?: string[];
  table?: { columns: string[]; rows: string[][] };
}

export interface Material {
  key: string;
  title: string;
  subtitle: string;
  sections: MaterialSection[];
}

export const materials: Record<string, Material> = {
  'mapa-resiliencia': {
    key: 'mapa-resiliencia',
    title: 'Mapa de Resiliência Mental e Rotina Diária do Vendedor',
    subtitle: 'Sessão 1 – Mentalidade de Vendedor de Elite',
    sections: [
      {
        heading: '1. Os 4 pilares da resiliência comercial',
        bullets: [
          'O "não" é sobre a oferta naquele momento, nunca sobre você como pessoa.',
          'Cada rejeição é um dado: registre o motivo e ajuste a próxima abordagem.',
          'Volume gera confiança: quem faz mais contatos sofre menos com cada "não".',
          'Protagonismo: o resultado do mês é consequência das suas atividades diárias, não da sorte.',
        ],
      },
      {
        heading: '2. Ressignificando a rejeição (exercício diário)',
        table: {
          columns: ['Pensamento automático', 'Pensamento de elite'],
          rows: [
            ['"Ele me rejeitou."', '"Ele rejeitou a proposta hoje. O que eu aprendi?"'],
            ['"Não sirvo para vendas."', '"Ainda não dominei esta etapa. Vou treinar."'],
            ['"Hoje não é meu dia."', '"Meu dia é feito dos próximos 10 contatos."'],
            ['"O cliente só quer preço."', '"Ainda não mostrei valor suficiente."'],
          ],
        },
      },
      {
        heading: '3. Rotina diária do vendedor de alta performance',
        table: {
          columns: ['Horário', 'Atividade', 'Objetivo'],
          rows: [
            ['06:30', 'Preparação física e mental (10 min de leitura ou áudio)', 'Energia e foco'],
            ['08:00', 'Revisão de metas e agenda do dia', 'Clareza de prioridades'],
            ['08:30 – 11:30', 'Bloco de prospecção (sem distrações)', 'Gerar oportunidades'],
            ['11:30 – 12:00', 'Follow-ups e retornos pendentes', 'Não deixar dinheiro na mesa'],
            ['13:30 – 17:00', 'Reuniões, apresentações e fechamentos', 'Converter oportunidades'],
            ['17:00 – 17:30', 'Registro no CRM e pós-venda', 'Relacionamento e indicações'],
            ['17:30', 'Revisão: 3 vitórias, 1 aprendizado, meta de amanhã', 'Evolução contínua'],
          ],
        },
      },
      {
        heading: '4. Checklist de energia (Andy Elliott)',
        checklist: [
          'Dormi pelo menos 7 horas',
          'Defini as 3 tarefas mais importantes do dia',
          'Fiz o primeiro contato antes das 9h',
          'Mantive a intensidade até o último atendimento',
          'Celebrei uma pequena vitória',
        ],
      },
      {
        heading: '5. Visão de longo prazo (Flávio Augusto)',
        paragraphs: [
          'Escreva onde você quer estar em 1, 3 e 5 anos. Depois, quebre cada meta em números de atividade: quantos contatos, reuniões e fechamentos por semana são necessários. Visão sem números é sonho; números sem visão são rotina sem propósito.',
        ],
      },
    ],
  },
  'checklist-atendimento': {
    key: 'checklist-atendimento',
    title: 'Checklist de Atendimento ao Cliente e Escuta Ativa',
    subtitle: 'Sessão 2 – Ensinamentos Básicos de Vendas',
    sections: [
      {
        heading: '1. Antes do atendimento',
        checklist: [
          'Pesquisei o cliente/empresa (site, redes sociais, histórico)',
          'Defini o objetivo desta conversa',
          'Preparei 5 perguntas abertas',
          'Ambiente, aparência e ferramentas prontos',
        ],
      },
      {
        heading: '2. Primeira impressão (primeiros 30 segundos)',
        checklist: [
          'Cumprimentei pelo nome, com sorriso e contato visual',
          'Me apresentei de forma clara e curta',
          'Expliquei a agenda da conversa e pedi permissão para fazer perguntas',
        ],
      },
      {
        heading: '3. Escuta ativa (Caio Carneiro)',
        paragraphs: ['Regra de ouro: o cliente deve falar 70% do tempo. Você fala 30%, e principalmente perguntando.'],
        checklist: [
          'Fiz perguntas abertas ("Como...", "O que...", "Por que...")',
          'Deixei o cliente terminar sem interromper',
          'Usei silêncio estratégico de 2 a 3 segundos após as respostas',
          'Parafraseei: "Se entendi bem, o seu maior desafio é..."',
          'Anotei as palavras exatas usadas pelo cliente',
          'Identifiquei a dor principal e o impacto dela',
        ],
      },
      {
        heading: '4. O ciclo básico de vendas',
        table: {
          columns: ['Etapa', 'Pergunta-chave', 'Indicador'],
          rows: [
            ['Prospecção', 'Estou falando com pessoas suficientes?', 'Contatos/dia'],
            ['Atendimento', 'Entendi a dor antes de apresentar?', 'Taxa de conversão'],
            ['Pós-venda', 'O cliente teve o resultado prometido?', 'Indicações e recompra'],
          ],
        },
      },
      {
        heading: '5. Encerramento e pós-venda',
        checklist: [
          'Resumi o que foi combinado e o próximo passo com data',
          'Enviei mensagem de agradecimento em até 24h',
          'Agendei contato de acompanhamento (7 e 30 dias)',
          'Pedi indicação no momento de maior satisfação',
        ],
      },
    ],
  },
  'script-vendas': {
    key: 'script-vendas',
    title: 'Script de Vendas e Quebra de Objeções',
    subtitle: 'Sessão 3 – Técnicas Práticas e Fechamento',
    sections: [
      {
        heading: '1. Script base de abordagem',
        bullets: [
          'Abertura: "Oi, [Nome]! Aqui é [Seu nome], da [Empresa]. Tudo bem? Posso te tomar 2 minutos?"',
          'Contexto: "Tenho ajudado [perfil de cliente] a [resultado]. Faz sentido conversarmos sobre isso?"',
          'Qualificação: "Hoje, como vocês fazem [processo]? O que mais te incomoda nisso?"',
          'Aprofundamento: "E quanto isso custa para você por mês, em tempo ou dinheiro?"',
          'Apresentação: conecte cada benefício a uma dor que o cliente disse com as palavras dele.',
          'Fechamento: "Faz sentido para você começarmos ainda esta semana?"',
        ],
      },
      {
        heading: '2. Perguntas-chave de qualificação',
        checklist: [
          'Qual é o principal problema que você quer resolver agora?',
          'Há quanto tempo isso acontece? O que já tentou?',
          'O que acontece se nada mudar nos próximos 6 meses?',
          'Quem mais participa dessa decisão?',
          'Existe um orçamento ou prazo definido?',
        ],
      },
      {
        heading: '3. As 5 objeções mais comuns',
        table: {
          columns: ['Objeção', 'Resposta modelo'],
          rows: [
            ['"Está caro."', '"Caro comparado a quê? Vamos olhar quanto o problema custa hoje para você."'],
            ['"Vou pensar."', '"Claro! Para eu te ajudar: o que exatamente você precisa pensar — valor, prazo ou encaixe?"'],
            ['"Preciso falar com meu sócio."', '"Perfeito. Que tal marcarmos 15 minutos com ele ainda esta semana?"'],
            ['"Não é o momento."', '"Entendo. O que precisaria acontecer para ser o momento? E o que custa esperar?"'],
            ['"Já tenho fornecedor."', '"Ótimo sinal, você valoriza isso. O que mudaria para ficar 100% satisfeito com ele?"'],
          ],
        },
      },
      {
        heading: '4. Técnicas de fechamento',
        bullets: [
          'Fechamento assumido: "Vou deixar a instalação para terça, pode ser?"',
          'Fechamento alternativo: "Prefere o plano mensal ou o anual com desconto?"',
          'Resumo de valor: recapitule as 3 dores e como cada uma é resolvida, e peça a decisão.',
          'Urgência legítima: condições reais com prazo (vagas, bônus, reajuste). Nunca invente escassez.',
          'Silêncio após a pergunta de fechamento: quem fala primeiro perde força.',
        ],
      },
      {
        heading: '5. Gatilhos de decisão (use com ética)',
        bullets: [
          'Prova social: cases e depoimentos de clientes parecidos.',
          'Autoridade: dados, certificações e resultados mensuráveis.',
          'Reciprocidade: entregue valor antes de pedir algo.',
          'Compromisso: pequenos "sins" ao longo da conversa.',
        ],
      },
    ],
  },
};
