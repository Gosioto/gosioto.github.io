import { createContext, useContext, type ReactNode, type MutableRefObject } from 'react';
import type { RuscordVoiceMember } from './api';
import type { VideoPlaybackMode } from './voice/videoTrackPick';

export type VoicePanelData = {
  channelId: string;
  channelName: string;
  members: RuscordVoiceMember[];
  leaveChannel: () => void;
  muteMic: boolean;
  setMuteMic: (v: boolean) => void;
  muteSounds: boolean;
  setMuteSounds: (v: boolean) => void;
  volume: number;
  /** Громкость по userId (0..1), для каждого участника отдельно */
  userVolumes: Record<string, number>;
  setUserVolume: (userId: string, value: number) => void;
  /** Камера включена (отправляется в канал) */
  videoEnabled: boolean;
  setVideoEnabled: (v: boolean) => void;
  /** Демонстрация экрана включена */
  screenShareEnabled: boolean;
  setScreenShareEnabled: (v: boolean) => void;
  /** Общий переключатель трансляции: выкл — микрофон/камера/экран не передаются */
  transmissionEnabled: boolean;
  setTransmissionEnabled: (v: boolean) => void;
};

export type StreamRole = 'camera' | 'screen' | 'none';

/** Режим выбора источника при нескольких видеотреках у одного участника. */
export type { VideoPlaybackMode };

export type VoiceStreamsContext = {
  /** Участники с видео (удалённые + при необходимости вы для локального превью). */
  remoteVideoUserIds: string[];
  /** Увеличивать при смене локального/удалённого MediaStream, чтобы <video> переподписался. */
  mediaEpoch: number;
  /** Совместимость: автоматический выбор трека (экран приоритетнее камеры при конфликте). */
  getRemoteStream: (uid: string) => MediaStream | null;
  /** Один видеотрек для &lt;video&gt;: экран / камера / авто (по метаданным канала). */
  getRemotePlaybackStream: (uid: string, mode: VideoPlaybackMode) => MediaStream | null;
  /** Доступные источники у участника для переключения UI. */
  getPlaybackSources: (uid: string) => ('screen' | 'camera')[];
  getRemoteName: (uid: string) => string;
  /** Для бейджей «Камера» / «Экран» (локально по ref, удалённо по voice members). */
  getStreamRole: (uid: string) => StreamRole;
  setRemoteAudioMuted: (uid: string, muted: boolean) => void;
};

/** Частичное обновление панели (используется из Ruscord при синхронизации канала). */
export type VoicePanelUpdate =
  | VoicePanelData
  | null
  | ((prev: VoicePanelData | null) => VoicePanelData | null)
  | Partial<VoicePanelData>;

/** JSON сообщения голосового hub (joined / left / voice_state_update). */
export type VoiceHubParsedMessage = Record<string, unknown>;

/** Агрегированное состояние mesh WebRTC для подписей в UI (в духе Discord). */
export type VoiceRtcPhase =
  | 'idle'
  | 'solo'
  | 'connecting'
  | 'negotiating'
  | 'rtc_ok'
  | 'weak'
  | 'no_route';

export type VoiceRtcStatus = {
  phase: VoiceRtcPhase;
  label: string;
  detail?: string;
};

export type VoiceUserFacingError = {
  level: 'warning' | 'error';
  message: string;
};

type ContextValue = {
  voicePanel: VoicePanelData | null;
  setVoicePanel: (data: VoicePanelUpdate) => void;
  streams?: VoiceStreamsContext | null;
  /** Сводка ICE/RTC по всем пирам (Dashboard). */
  voiceRtcStatus: VoiceRtcStatus | null;
  /** Ошибка для пользователя (не технический voiceLog). */
  voiceUserFacingError: VoiceUserFacingError | null;
  dismissVoiceUserFacingError: () => void;
  /** Каналы сервера RUscord для объединённой подписки WS (один сокет с Dashboard). */
  hubSubscriptionChannelIds: string[];
  setHubSubscriptionChannelIds: (ids: string[]) => void;
  /** Если на сервере нет голосовых каналов — подписка только на события гильдии. */
  hubSubscriptionServerId: string | null;
  setHubSubscriptionServerId: (id: string | null) => void;
  registerVoiceHubHandler: (handler: (data: VoiceHubParsedMessage) => void) => () => void;
  /**
   * Ruscord подписывает сюда очистку локального состояния при выходе из панели Dashboard;
   * иначе `myCurrentChannelId` остаётся и эффект sync снова зовёт setVoicePanel.
   */
  ruscordLocalLeaveRef: MutableRefObject<((channelId: string) => void) | null>;
};

const RuscordVoiceContext = createContext<ContextValue | null>(null);

export function RuscordVoiceProvider({
  value,
  children,
}: {
  value: ContextValue;
  children: ReactNode;
}) {
  return (
    <RuscordVoiceContext.Provider value={value}>
      {children}
    </RuscordVoiceContext.Provider>
  );
}

export function useRuscordVoice() {
  const ctx = useContext(RuscordVoiceContext);
  return ctx;
}
