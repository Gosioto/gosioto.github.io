import type { VoiceRtcStatus } from '../RuscordVoiceContext';

/**
 * Сводка по всем RTCPeerConnection к одному статусу для панели голоса.
 */
export function aggregateVoiceRtcStatus(
  otherUserIds: string[],
  getPc: (uid: string) => RTCPeerConnection | undefined,
  hasRemoteAudio: (uid: string) => boolean,
): VoiceRtcStatus {
  if (otherUserIds.length === 0) {
    return { phase: 'solo', label: 'Вы одни в канале' };
  }
  const pcs = otherUserIds.map((uid) => getPc(uid)).filter((pc): pc is RTCPeerConnection => pc != null);
  if (pcs.length < otherUserIds.length) {
    return { phase: 'connecting', label: 'Подключение к участникам…' };
  }

  let hasFailed = false;
  let hasDisconnected = false;
  let allIceGood = true;
  let allConnGood = true;

  for (const uid of otherUserIds) {
    const pc = getPc(uid);
    if (!pc) continue;
    const ice = pc.iceConnectionState;
    const conn = pc.connectionState;
    if (ice === 'failed' || conn === 'failed') hasFailed = true;
    if (ice === 'disconnected') hasDisconnected = true;
    if (ice !== 'connected' && ice !== 'completed') allIceGood = false;
    if (conn !== 'connected') allConnGood = false;
  }

  if (hasFailed) {
    return {
      phase: 'no_route',
      label: 'Нет маршрута к участнику',
      detail: 'Проверьте сеть, VPN или настройте TURN (VITE_ICE_SERVERS).',
    };
  }
  if (hasDisconnected) {
    return { phase: 'weak', label: 'Поиск маршрута…', detail: 'Временная потеря связи с участником.' };
  }

  let missingAudio = false;
  for (const uid of otherUserIds) {
    if (!hasRemoteAudio(uid)) missingAudio = true;
  }

  if (!allIceGood || !allConnGood || missingAudio) {
    return {
      phase: 'negotiating',
      label: 'Согласование голоса…',
      detail: missingAudio ? 'Ожидание аудио от участников' : undefined,
    };
  }

  return { phase: 'rtc_ok', label: 'Голосовая связь активна' };
}
