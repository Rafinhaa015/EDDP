-- =====================================================================
-- Plataforma Vendas de Simples — Esquema relacional (PostgreSQL 13+)
-- Baseado no esquema sugerido na especificação, com as extensões
-- necessárias para LGPD, recuperação de senha e anotações pessoais.
-- Idempotente: pode ser executado várias vezes.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    token_version INT NOT NULL DEFAULT 0, -- incrementado para invalidar JWTs (troca de senha / logout global)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Módulos / Sessões
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    material_title VARCHAR(255),           -- PDF de apoio da sessão
    material_key VARCHAR(80),              -- chave do material servido pela API (autenticado)
    order_index INT NOT NULL
);

-- Aulas
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    slug VARCHAR(80) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,               -- caminho/ID do vídeo no provedor (HLS); nunca exposto sem token
    duration_seconds INT NOT NULL,
    order_index INT NOT NULL,
    pdf_attachment_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, order_index);

-- Progresso do Usuário
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    last_position_seconds INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Anotações pessoais por aula
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Aceite de Termos (LGPD)
CREATE TABLE IF NOT EXISTS lgpd_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    consent_type VARCHAR(40) NOT NULL DEFAULT 'terms_of_use', -- terms_of_use | cookies
    terms_version VARCHAR(20),
    details JSONB,
    consent_given BOOLEAN NOT NULL,
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Consentimento de cookies pode vir de visitante anônimo
ALTER TABLE lgpd_consents ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consents_user ON lgpd_consents(user_id);

-- Tokens de recuperação de senha (armazenados como hash SHA-256; expiram em 15 min)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificados emitidos (código público de validação)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
