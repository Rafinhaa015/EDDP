-- =====================================================================
-- Conteúdo do curso: 3 sessões, 9 aulas (~3h30 no total).
-- Idempotente (UPSERT por slug). Substitua `video_url` pelo caminho
-- HLS do seu provedor (ex.: Bunny.net: "<video-id>/playlist.m3u8").
-- =====================================================================

INSERT INTO modules (slug, title, description, cover_image_url, material_title, material_key, order_index) VALUES
('mentalidade', 'Mentalidade de Vendedor de Elite',
 'Vença o medo da rejeição, construa visão de longo prazo e desenvolva energia imparável para executar todos os dias.',
 '/covers/mentalidade.svg', 'Mapa de Resiliência Mental e Rotina Diária do Vendedor', 'mapa-resiliencia', 1),
('fundamentos', 'Ensinamentos Básicos de Vendas',
 'Domine o ciclo de vendas, aprenda a escutar mais do que falar e cause uma primeira impressão impecável.',
 '/covers/fundamentos.svg', 'Checklist de Atendimento ao Cliente e Escuta Ativa', 'checklist-atendimento', 2),
('tecnicas', 'Técnicas Práticas e Fechamento',
 'Qualifique leads, contorne as objeções mais comuns e feche vendas com gatilhos de decisão de alto impacto.',
 '/covers/tecnicas.svg', 'Script de Vendas e Quebra de Objeções', 'script-vendas', 3)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, cover_image_url = EXCLUDED.cover_image_url,
  material_title = EXCLUDED.material_title, material_key = EXCLUDED.material_key, order_index = EXCLUDED.order_index;

INSERT INTO lessons (module_id, slug, title, description, video_url, duration_seconds, order_index)
SELECT m.id, v.slug, v.title, v.description, v.video_url, v.duration_seconds, v.order_index
FROM (VALUES
  ('mentalidade', 'psicologia-do-nao', 'A Psicologia do NÃO – Vencendo o Medo da Rejeição',
   'Entenda por que o "não" faz parte do processo e transforme cada rejeição em dado para a próxima venda.',
   'demo/aula-1-1/playlist.m3u8', 900, 1),
  ('mentalidade', 'visao-longo-prazo', 'Visão de Longo Prazo e Protagonismo (Visão Flávio Augusto)',
   'Assuma o protagonismo da sua carreira e troque o imediatismo por uma visão de construção de patrimônio.',
   'demo/aula-1-2/playlist.m3u8', 900, 2),
  ('mentalidade', 'foco-e-energia', 'A Reta Final – Foco e Energia Imparável (Energia Andy Elliott)',
   'Rotina de alta performance, intensidade e disciplina para manter a energia do primeiro ao último contato do dia.',
   'demo/aula-1-3/playlist.m3u8', 1200, 3),
  ('fundamentos', 'ciclo-de-vendas', 'O Ciclo Básico de Vendas: Prospecção, Atendimento e Pós-Venda',
   'As três etapas que sustentam qualquer operação comercial e como medir cada uma delas.',
   'demo/aula-2-1/playlist.m3u8', 1200, 1),
  ('fundamentos', 'escutar-mais', 'Como Escutar Mais do que Falar (Abordagem Caio Carneiro)',
   'Escuta ativa na prática: perguntas abertas, silêncio estratégico e espelhamento.',
   'demo/aula-2-2/playlist.m3u8', 1500, 2),
  ('fundamentos', 'autoridade', 'Construção de Autoridade e Primeira Impressão Impecável',
   'Postura, preparo e linguagem que fazem o cliente confiar em você nos primeiros 30 segundos.',
   'demo/aula-2-3/playlist.m3u8', 1500, 3),
  ('tecnicas', 'qualificacao-de-leads', 'Qualificação de Leads e Levantamento de Dores (Perguntas Chave)',
   'Descubra rapidamente quem tem dor, orçamento e poder de decisão — e pare de perder tempo.',
   'demo/aula-3-1/playlist.m3u8', 1500, 1),
  ('tecnicas', 'cinco-objecoes', 'Contorno Prático das 5 Objeções Mais Comuns',
   '"Está caro", "vou pensar", "preciso falar com meu sócio", "não é o momento" e "já tenho fornecedor".',
   'demo/aula-3-2/playlist.m3u8', 1800, 2),
  ('tecnicas', 'fechamento', 'Técnicas de Fechamento de Alto Impacto e Gatilhos de Decisão',
   'Fechamento assumido, alternativo e por urgência legítima: peça a venda com confiança.',
   'demo/aula-3-3/playlist.m3u8', 2100, 3)
) AS v(module_slug, slug, title, description, video_url, duration_seconds, order_index)
JOIN modules m ON m.slug = v.module_slug
ON CONFLICT (slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, description = EXCLUDED.description,
  duration_seconds = EXCLUDED.duration_seconds, order_index = EXCLUDED.order_index;
