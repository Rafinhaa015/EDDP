export interface CookieConsent {
  choice: 'accept_all' | 'custom' | 'reject';
  analytics: boolean;
  marketing: boolean;
  date: string;
}

const KEY = 'vs_cookie_consent';
export const OPEN_COOKIE_SETTINGS = 'vs:open-cookie-settings';

export function readConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CookieConsent) : null;
  } catch {
    return null;
  }
}

export function writeConsent(c: CookieConsent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* navegação privada: segue sem persistir */
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS));
}
