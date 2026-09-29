import 'dotenv/config';

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const jwtSecret = process.env.JWT_SECRET ?? '';

if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres em produção.');
}

export const config = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT ?? 4000),
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://vendas:vendas@localhost:5432/vendas_de_simples',
  jwtSecret: jwtSecret || 'dev-only-secret-change-me-dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bcryptRounds: Math.max(10, Number(process.env.BCRYPT_ROUNDS ?? 12)),
  sequentialUnlock: bool(process.env.SEQUENTIAL_UNLOCK, true),
  watermarkEnabled: bool(process.env.WATERMARK_ENABLED, true),
  termsVersion: process.env.TERMS_VERSION ?? '2026-09',
  resetTokenTtlMinutes: 15,
  loginRateLimit: { windowMs: 60_000, max: 5 },
  video: {
    cdnBaseUrl: (process.env.VIDEO_CDN_BASE_URL ?? '').replace(/\/$/, ''),
    tokenSecret: process.env.VIDEO_TOKEN_SECRET ?? '',
    ttlSeconds: Number(process.env.VIDEO_TOKEN_TTL_SECONDS ?? 3600),
    demoUrl: process.env.VIDEO_DEMO_URL ?? 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  email: {
    provider: (process.env.EMAIL_PROVIDER ?? 'console') as 'resend' | 'sendgrid' | 'console',
    from: process.env.EMAIL_FROM ?? 'Vendas de Simples <nao-responda@seudominio.com.br>',
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    sendgridApiKey: process.env.SENDGRID_API_KEY ?? '',
  },
  productName: process.env.PRODUCT_NAME ?? 'Vendas de Simples',
  supportEmail: process.env.SUPPORT_EMAIL ?? 'suporte@seudominio.com.br',
  cookies: {
    auth: 'vs_session',
    csrf: 'vs_csrf',
  },
};
