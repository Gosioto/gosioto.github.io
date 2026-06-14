/**
 * Базовый STUN; дополнительные серверы (в т.ч. TURN) — через `VITE_ICE_SERVERS` (JSON-массив RTCIceServer).
 * См. `frontend/.env.example`: для стабильного mesh-voice за NAT рекомендуется свой TURN (coturn и т.д.).
 */

const DEFAULT_STUN: RTCIceServer = { urls: 'stun:stun.l.google.com:19302' };

export function parseIceServersFromEnv(raw: string | undefined): RTCIceServer[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is RTCIceServer => {
      if (x == null || typeof x !== 'object') return false;
      return 'urls' in x && (typeof (x as RTCIceServer).urls === 'string' || Array.isArray((x as RTCIceServer).urls));
    });
  } catch {
    return [];
  }
}

export function buildVoiceRtcConfiguration(): RTCConfiguration {
  const raw =
    typeof import.meta.env !== 'undefined'
      ? (import.meta.env.VITE_ICE_SERVERS as string | undefined)
      : undefined;
  const extra = parseIceServersFromEnv(raw);
  return {
    iceServers: [DEFAULT_STUN, ...extra],
  };
}
