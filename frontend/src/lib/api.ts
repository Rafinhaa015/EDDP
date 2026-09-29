export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public field?: string) {
    super(message);
  }
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

async function ensureCsrf() {
  let token = readCookie('vs_csrf');
  if (!token) {
    await fetch('/api/auth/me', { credentials: 'same-origin' });
    token = readCookie('vs_csrf');
  }
  return token;
}

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const method = (rest.method ?? 'GET').toUpperCase();
  const h = new Headers(headers);
  if (json !== undefined) h.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD'].includes(method)) h.set('X-CSRF-Token', await ensureCsrf());

  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...rest,
    method,
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : undefined;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data as { error?: string })?.error ?? 'Não foi possível completar a ação. Tente novamente.',
      (data as { code?: string })?.code,
      (data as { field?: string })?.field,
    );
  }
  return data as T;
}

/** Baixa um arquivo autenticado (PDF/JSON) disparando o download no navegador. */
export async function download(path: string, fallbackName: string) {
  const res = await fetch(`/api${path}`, { credentials: 'same-origin' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.error ?? 'Falha no download.');
  }
  const blob = await res.blob();
  const name = res.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1] ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
