/** Базовый origin API (без trailing slash). Пусто — same-origin (/api, /health). */
function normalizeOrigin(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  return raw.trim().replace(/\/+$/, '');
}

const API_ORIGIN = normalizeOrigin(import.meta.env.VITE_API_ORIGIN);

/** REST prefix: `/api` locally or `https://api.example.com/api` in prod. */
export const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

/** Health check URL. */
export function healthUrl(): string {
  return API_ORIGIN ? `${API_ORIGIN}/health` : '/health';
}

/** WebSocket URL for `/api/ws` with optional query string (include `?token=…`). */
export function wsUrl(query = ''): string {
  if (API_ORIGIN) {
    const u = new URL('/api/ws', API_ORIGIN);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    if (query.startsWith('?')) u.search = query.slice(1);
    else if (query) u.search = query;
    return u.toString();
  }
  const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost';
  return `${proto}//${host}/api/ws${query.startsWith('?') ? query : query ? `?${query}` : ''}`;
}
