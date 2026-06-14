/**
 * Ограничение исходящих битрейтов mesh-WebRTC: меньше перегруз uplink и быстрее стабилизация кодека.
 * Для уровня Discord всё равно нужен SFU + TURN; здесь — клиентский потолок без смены топологии.
 */
import { voiceLog } from '../voiceLog';

/** Речь Opus: типичный потолок для комнаты (кбит/с порядка 48–64). */
const AUDIO_MAX_BITRATE = 64_000;

/** Камера в голосовом канале: баланс качество / число исходящих связей в mesh. */
const CAMERA_MAX_BITRATE = 2_500_000;

/** Демонстрация экрана: ниже избыточных значений при нескольких пирах. */
const SCREEN_MAX_BITRATE = 4_000_000;

export async function applyOutboundRtpPolicies(pc: RTCPeerConnection): Promise<void> {
  const tasks = pc.getSenders().map(async (sender) => {
    const track = sender.track;
    if (!track) return;
    try {
      const params = sender.getParameters();
      if (!params.encodings?.length) {
        params.encodings = [{}];
      }
      const enc = params.encodings[0];
      if (track.kind === 'audio') {
        enc.maxBitrate = AUDIO_MAX_BITRATE;
      } else if (track.kind === 'video') {
        const hint = track.contentHint;
        enc.maxBitrate = hint === 'detail' || hint === 'text' ? SCREEN_MAX_BITRATE : CAMERA_MAX_BITRATE;
      }
      await sender.setParameters(params);
    } catch (e) {
      voiceLog('setParameters (media policy) skipped', { kind: track.kind, e });
    }
  });
  await Promise.all(tasks);
}
