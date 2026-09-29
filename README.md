# Vendas de Simples — Plataforma LMS / Área de Membros

Plataforma de cursos para vendedores e empreendedores iniciantes (metodologia Flávio Augusto, Caio Carneiro e Andy Elliott).
Foco em UX: interface enxuta, resposta rápida e execução prática.

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS 4 + hls.js |
| Backend | Node.js + Express 5 + TypeScript + Zod |
| Banco | PostgreSQL (compatível com Supabase) |
| Vídeos | HLS com URL assinada e expirável (Bunny.net Token Auth; adaptável a CloudFront) |
| E-mails | Resend, SendGrid ou console (dev) |

## Estrutura

```
database/   schema.sql (esquema relacional) e seed.sql (3 sessões / 9 aulas, ~3h30)
backend/    API REST (/api/*) — auth, curso, progresso, anotações, PDFs, certificado, LGPD
frontend/   Next.js — landing/login, dashboard, sala de aula, perfil, páginas legais e suporte
```

## Rodando localmente

Pré-requisitos: Node 20+ e PostgreSQL 14+ (ou `docker compose up -d db`).

```bash
npm install
cp backend/.env.example backend/.env        # ajuste DATABASE_URL e JWT_SECRET
cp frontend/.env.example frontend/.env.local # WhatsApp, e-mail de suporte, CNPJ
npm run db:migrate                           # cria tabelas + conteúdo do curso (idempotente)
npm run dev:api                              # http://localhost:4000
npm run dev:web                              # http://localhost:3000
```

O Next.js faz proxy de `/api/*` para o backend (`API_URL`), então os cookies de sessão são first-party.

Testes de integração da API (precisam de um banco `vendas_test`, ou defina `TEST_DATABASE_URL`):

```bash
npm test
```

## Funcionalidades

**Telas**
- **Landing / Login** — hero com vídeo de apresentação, formulário de cadastro/login embutido, modais de Cadastro e Esqueci minha senha.
- **Dashboard** — header fixo com progresso geral, boas-vindas personalizadas, atalho "continuar de onde parou", cards 3D por sessão (capa, nº de aulas, tempo, status Não iniciado / Em andamento / Concluído, bloqueio).
- **Sala de aula** — 2 colunas (1 no mobile); player customizado (play/pause, barra de tempo, ±10s, volume, velocidade 0.5x–2x, tela cheia, atalhos de teclado, retomada de onde parou); botão "Marcar como Concluída"; abas Downloads e Anotações pessoais (salvamento automático); playlist em acordeão com checklist.
- **Perfil** — editar nome/telefone, alterar senha, certificado (liberado com 100%), LGPD (baixar dados, excluir conta).
- **Rodapé** de 4 colunas em todas as telas, **widget de WhatsApp** com badge pulsante, páginas de Termos, Privacidade, Cookies, LGPD e Suporte (FAQ), validação pública de certificado em `/certificado/<código>`.

**Segurança e LGPD**
- Senhas com `bcrypt` (fator configurável, mínimo 10; padrão 12).
- JWT em cookie `HttpOnly` + `SameSite=Lax` + `Secure` em produção; proteção CSRF por double-submit (`X-CSRF-Token`); `token_version` invalida sessões na troca de senha.
- Rate limit: 5 logins incorretos por minuto por IP; limite extra em cadastro e recuperação de senha.
- Recuperação de senha com token aleatório de uso único, guardado como hash SHA-256 e expirando em 15 minutos; respostas que não revelam se o e-mail existe.
- Aceite dos termos registrado com timestamp, IP, User-Agent e versão; escolhas do banner de cookies (Permitir todos / Personalizar / Rejeitar) também registradas.
- Exportação dos dados do titular (JSON) e exclusão permanente em cascata.
- Vídeos só via URL HLS assinada e temporária (nunca expostos sem login), sem menu de contexto, download ou PiP no player, e marca d'água móvel com o e-mail do aluno. PDFs gerados sob demanda, só para alunos logados, com o e-mail do aluno no rodapé.

## Configuração

| Variável (backend) | Descrição |
| --- | --- |
| `SEQUENTIAL_UNLOCK` | `true` = a Sessão N só libera com 100% da Sessão N-1; `false` = liberação total |
| `WATERMARK_ENABLED` | Mostra a marca d'água com o e-mail do aluno no player |
| `VIDEO_CDN_BASE_URL` / `VIDEO_TOKEN_SECRET` | Pull Zone da Bunny.net com Token Authentication. Em branco = stream de demonstração |
| `EMAIL_PROVIDER` | `resend`, `sendgrid` ou `console` |
| `TRUST_PROXY` | Número de proxies confiáveis, para obter o IP real (padrão 1) |

**Cadastrar os vídeos reais:** envie cada aula ao provedor e atualize `lessons.video_url` com o caminho da playlist, por exemplo
`UPDATE lessons SET video_url = '<video-id>/playlist.m3u8' WHERE slug = 'psicologia-do-nao';`.
O seed não sobrescreve `video_url` de aulas que já existem.

## Deploy sugerido
- **Frontend:** Vercel/Netlify (`frontend/`), com `API_URL` apontando para o backend.
- **Backend:** Render/Railway/DigitalOcean (`npm run build -w backend && npm start -w backend`), com `NODE_ENV=production` e um `JWT_SECRET` de 32+ caracteres.
- **Banco:** PostgreSQL gerenciado ou Supabase; rode `npm run db:migrate` uma vez.

> Os textos legais (Termos, Privacidade, Cookies) são modelos e devem ser revisados por um profissional jurídico antes da publicação.
