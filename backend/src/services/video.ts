import crypto from 'node:crypto';
import { config } from '../config.js';

export interface SignedStream {
  url: string;
  expiresAt: string;
  demo: boolean;
}

/**
 * Gera URL HLS assinada e expirável (Bunny.net CDN Token Authentication — SHA256).
 * token = base64url( sha256( secret + path + expires ) ), com assinatura válida para o diretório
 * do vídeo (token_path), permitindo que playlist e segmentos .ts sejam servidos com o mesmo token.
 * Sem VIDEO_CDN_BASE_URL/VIDEO_TOKEN_SECRET configurados, retorna um stream HLS de demonstração.
 */
export function signVideoUrl(videoPath: string, now = Date.now()): SignedStream {
  const { cdnBaseUrl, tokenSecret, ttlSeconds, demoUrl } = config.video;
  const expires = Math.floor(now / 1000) + ttlSeconds;
  const expiresAt = new Date(expires * 1000).toISOString();

  if (!cdnBaseUrl || !tokenSecret) {
    return { url: demoUrl, expiresAt, demo: true };
  }

  const cleanPath = '/' + videoPath.replace(/^\/+/, '');
  const tokenPath = cleanPath.slice(0, cleanPath.lastIndexOf('/') + 1);
  const hashable = tokenSecret + tokenPath + expires + `token_path=${tokenPath}`;
  const token = crypto
    .createHash('sha256')
    .update(hashable)
    .digest('base64')
    .replace(/\n/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const url = `${cdnBaseUrl}/bcdn_token=${token}&expires=${expires}&token_path=${encodeURIComponent(tokenPath)}${cleanPath}`;
  return { url, expiresAt, demo: false };
}
