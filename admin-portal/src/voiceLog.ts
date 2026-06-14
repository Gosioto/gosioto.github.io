/**
 * Логи для отладки голосовых каналов и WebRTC.
 * В консоли фильтровать по [Voice] или [Ruscord].
 * Выключить: localStorage.setItem('voice_log_off', '1')
 */
const LOG_OFF_KEY = 'voice_log_off';

function logEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(LOG_OFF_KEY) !== '1';
}

function log(prefix: string, ...args: unknown[]) {
  if (!logEnabled()) return;
  console.log(`[${prefix}]`, ...args);
}

export function voiceLogEnabled(): boolean {
  return logEnabled();
}

export function voiceLog(...args: unknown[]) {
  log('Voice', ...args);
}

export function ruscordLog(...args: unknown[]) {
  log('Ruscord', ...args);
}
