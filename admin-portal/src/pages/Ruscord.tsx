import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import {
  useRuscordVoice,
  type VoiceHubParsedMessage,
  type VideoPlaybackMode,
  type VoiceRtcStatus,
} from '../RuscordVoiceContext';
import {
  ruscordMe,
  ruscordListServers,
  ruscordListServerChannelsFull,
  ruscordChannelsWithMembers,
  ruscordChannelMembers,
  ruscordJoinChannel,
  ruscordLeaveChannel,
  ruscordCreateServer,
  ruscordCreateInvite,
  ruscordAcceptInvite,
  ruscordListChannelMessages,
  ruscordPostChannelMessage,
  ruscordListServerMembers,
  ruscordPatchChannel,
  ruscordDeleteChannel,
  ruscordReorderChannels,
  ruscordMarkChannelRead,
  ruscordListInvites,
  getFriends,
  type RuscordServer,
  type RuscordGuildChannel,
  type RuscordGuildMessage,
  type RuscordVoiceMember,
  type RuscordChannelWithMembers,
  type RuscordServerMember,
  type Friend,
} from '../api';
import Avatar from '../components/Avatar';
import RuscordServerIcon from '../components/RuscordServerIcon';
import ServerSettingsModal from '../components/ServerSettingsModal';
import UserSettingsModal from '../components/UserSettingsModal';
import { Badge, useToast, IconSettings } from '../ui';
import { formatDisplayName } from '../utils/displayName';
import VoiceMemberIndicators from '../components/VoiceMemberIndicators';
import { ruscordLog } from '../voiceLog';
import styles from './Ruscord.module.css';

const STORAGE_MUTE_MIC = 'ruscord_mute_mic';
const STORAGE_MUTE_SOUNDS = 'ruscord_mute_sounds';

function channelStorageKey(serverId: string) {
  return `ruscord:server:${serverId}:channel`;
}

/** Блок «Активный канал»: стримы и веб-камеры участников; театр (вкладка), полный экран монитора, PiP */
function ActiveChannelStreams() {
  const { user: me } = useAuth();
  const ctx = useRuscordVoice();
  const streams = ctx?.streams;
  const voiceRtcStatus = ctx?.voiceRtcStatus ?? null;
  const rtcBadgeMod = (phase: VoiceRtcStatus['phase']) => {
    switch (phase) {
      case 'rtc_ok':
        return styles.voiceRtcBadgeOk;
      case 'no_route':
        return styles.voiceRtcBadgeBad;
      case 'weak':
      case 'negotiating':
      case 'connecting':
        return styles.voiceRtcBadgeWarn;
      default:
        return styles.voiceRtcBadgeNeutral;
    }
  };
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [mutedStreams, setMutedStreams] = useState<Record<string, boolean>>({});
  const [theaterOpen, setTheaterOpen] = useState(false);
  const [pipHint, setPipHint] = useState<string | null>(null);
  /** Экран vs камера при нескольких видеотреках у одного участника. */
  const [playbackByUid, setPlaybackByUid] = useState<Record<string, VideoPlaybackMode>>({});
  const mainRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);

  const ids = streams?.remoteVideoUserIds ?? [];
  const streamEpoch = streams?.mediaEpoch ?? 0;
  const current = selectedUid && ids.includes(selectedUid) ? selectedUid : ids[0] ?? null;

  const isLocalUid = useCallback((uid: string) => me?.id != null && String(me.id) === uid, [me?.id]);

  const playbackModeFor = useCallback(
    (uid: string): VideoPlaybackMode => playbackByUid[uid] ?? 'auto',
    [playbackByUid],
  );

  const setPlaybackModeFor = useCallback((uid: string, mode: VideoPlaybackMode) => {
    setPlaybackByUid((prev) => ({ ...prev, [uid]: mode }));
  }, []);

  useEffect(() => {
    if (ids.length > 0 && (!selectedUid || !ids.includes(selectedUid))) setSelectedUid(ids[0]);
  }, [ids, selectedUid]);

  useEffect(() => {
    if (!theaterOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [theaterOpen]);

  useEffect(() => {
    if (!theaterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTheaterOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [theaterOpen]);

  if (!streams) {
    return (
      <section id="active-channel" className={styles.activeChannelBlock}>
        <div className={styles.activeChannelHead}>
          <h2 className={styles.membersTitle}>Активный канал</h2>
          {voiceRtcStatus ? (
            <span
              className={`${styles.voiceRtcBadge} ${rtcBadgeMod(voiceRtcStatus.phase)}`}
              title={voiceRtcStatus.detail}
            >
              {voiceRtcStatus.label}
            </span>
          ) : null}
        </div>
        <p className={styles.emptyHint}>
          Зайдите в голосовой канал: здесь появятся демонстрация экрана и веб-камеры участников.
        </p>
      </section>
    );
  }

  if (ids.length === 0) {
    return (
      <section id="active-channel" className={styles.activeChannelBlock}>
        <div className={styles.activeChannelHead}>
          <h2 className={styles.membersTitle}>Активный канал</h2>
          {voiceRtcStatus ? (
            <span
              className={`${styles.voiceRtcBadge} ${rtcBadgeMod(voiceRtcStatus.phase)}`}
              title={voiceRtcStatus.detail}
            >
              {voiceRtcStatus.label}
            </span>
          ) : null}
        </div>
        <p className={styles.activeChannelWaiting}>
          Вы в голосовом канале. Включите камеру или демонстрацию экрана в панели голоса слева или дождитесь участников с видео.
        </p>
        <div className={styles.streamsWrap}>
          <div className={`${styles.streamMain} ${styles.streamMainPlaceholder}`}>
            <div className={styles.activeChannelSkeleton}>
              <span className={styles.skeletonLabel}>Главное окно</span>
            </div>
          </div>
          <div className={`${styles.streamThumbs} ${styles.streamThumbsSkeleton}`}>
            <div className={styles.skeletonThumb} aria-hidden />
            <div className={styles.skeletonThumb} aria-hidden />
          </div>
        </div>
      </section>
    );
  }

  const pipSupported = typeof document !== 'undefined' && document.pictureInPictureEnabled;

  const toggleMonitorFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        return;
      }
      const el = mainVideoRef.current ?? mainRef.current;
      if (el?.requestFullscreen) await el.requestFullscreen();
    } catch {
      // ignore
    }
  };

  const toggleMuteStream = (uid: string) => {
    const next = !mutedStreams[uid];
    setMutedStreams((prev) => ({ ...prev, [uid]: next }));
    streams.setRemoteAudioMuted(uid, next);
  };

  const togglePiP = async () => {
    const video = mainVideoRef.current;
    if (!video) return;
    if (!pipSupported) {
      setPipHint(
        'Картинка в картинке недоступна (браузер или контекст без поддержки). Часто нужен HTTPS; для HTTP попробуйте другой браузер или системный полный экран.',
      );
      window.setTimeout(() => setPipHint(null), 6000);
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      setPipHint('Не удалось открыть режим «картинка в картинке». Проверьте политики браузера и автоплей.');
      window.setTimeout(() => setPipHint(null), 5000);
    }
  };

  return (
    <section id="active-channel" className={styles.activeChannelBlock}>
      <div className={styles.activeChannelHead}>
        <h2 className={styles.membersTitle}>Активный канал</h2>
        {voiceRtcStatus ? (
          <span
            className={`${styles.voiceRtcBadge} ${rtcBadgeMod(voiceRtcStatus.phase)}`}
            title={voiceRtcStatus.detail}
          >
            {voiceRtcStatus.label}
          </span>
        ) : null}
      </div>
      {pipHint && <p className={styles.streamHint}>{pipHint}</p>}
      <div className={`${styles.streamsWrap} ${theaterOpen ? styles.streamsWrapTheater : ''}`}>
        {theaterOpen && (
          <div className={styles.theaterBar}>
            <span className={styles.theaterBarTitle}>Просмотр на весь экран страницы</span>
            <button type="button" className={styles.theaterCloseBtn} onClick={() => setTheaterOpen(false)}>
              Закрыть (Esc)
            </button>
          </div>
        )}
        <div className={styles.streamMain} ref={mainRef}>
          {current && (
            <StreamVideo
              key={`main-${current}-${streamEpoch}-${playbackModeFor(current)}`}
              uid={current}
              playbackMode={playbackModeFor(current)}
              getPlaybackStream={streams.getRemotePlaybackStream}
              getName={streams.getRemoteName}
              videoRef={mainVideoRef}
              isLocal={isLocalUid(current)}
            />
          )}
          {current && (
            <div className={styles.streamOverlay}>
              <div className={styles.streamOverlayLeft}>
                <span className={styles.streamOverlayTitle}>
                  {streams.getStreamRole(current) === 'screen' ? (
                    <span className={styles.streamBadge}>Экран</span>
                  ) : streams.getStreamRole(current) === 'camera' ? (
                    <span className={`${styles.streamBadge} ${styles.streamBadgeCamera}`}>Камера</span>
                  ) : null}
                  <span className={styles.streamOwner}>{streams.getRemoteName(current)}</span>
                </span>
                {streams.getPlaybackSources(current).length > 1 ? (
                  <div className={styles.streamSourceToggle} role="group" aria-label="Источник видео">
                    {(['auto', 'screen', 'camera'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`${styles.streamSourceBtn} ${playbackModeFor(current) === mode ? styles.streamSourceBtnActive : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaybackModeFor(current, mode);
                        }}
                        title={
                          mode === 'auto'
                            ? 'Авто: экран, если включена демонстрация'
                            : mode === 'screen'
                              ? 'Показывать экран'
                              : 'Показывать камеру'
                        }
                      >
                        {mode === 'auto' ? 'Авто' : mode === 'screen' ? 'Экран' : 'Камера'}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className={styles.streamActions}>
                <button
                  type="button"
                  className={`${styles.streamBtn} ${theaterOpen ? styles.streamBtnActive : ''}`}
                  onClick={() => setTheaterOpen((v) => !v)}
                  title="На весь экран страницы (окно браузера)"
                  aria-label="На весь экран страницы"
                >
                  <TheaterPageIcon />
                </button>
                <button
                  type="button"
                  className={styles.streamBtn}
                  onClick={toggleMonitorFullscreen}
                  title="Полный экран монитора (системный)"
                  aria-label="Полный экран монитора"
                >
                  <MonitorFullscreenIcon />
                </button>
                <button
                  type="button"
                  className={styles.streamBtn}
                  onClick={togglePiP}
                  title={
                    pipSupported
                      ? document.pictureInPictureElement
                        ? 'Выйти из картинки в картинке'
                        : 'Картинка в картинке'
                      : 'Картинка в картинке недоступна в этом браузере'
                  }
                  aria-label="Картинка в картинке"
                >
                  <PiPIcon />
                </button>
                {!isLocalUid(current) && (
                  <button
                    type="button"
                    className={styles.streamBtn}
                    onClick={() => toggleMuteStream(current)}
                    title={mutedStreams[current] ? 'Включить звук' : 'Убрать звук стрима'}
                    aria-label={mutedStreams[current] ? 'Включить звук стрима' : 'Выключить звук стрима'}
                  >
                    <SpeakerIcon muted={mutedStreams[current]} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.streamThumbs}>
          {ids.map((uid) => (
            <button
              key={uid}
              type="button"
              className={`${styles.streamThumb} ${uid === current ? styles.streamThumbActive : ''}`}
              onClick={() => setSelectedUid(uid)}
            >
              <StreamVideo
                key={`thumb-${uid}-${streamEpoch}-${playbackModeFor(uid)}`}
                uid={uid}
                playbackMode={playbackModeFor(uid)}
                getPlaybackStream={streams.getRemotePlaybackStream}
                getName={streams.getRemoteName}
                isLocal={isLocalUid(uid)}
              />
              {streams.getPlaybackSources(uid).length > 1 ? (
                <div className={styles.streamThumbSourceRow} role="group" aria-label="Источник превью">
                  {(['auto', 'screen', 'camera'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`${styles.streamThumbSourceBtn} ${playbackModeFor(uid) === mode ? styles.streamThumbSourceBtnActive : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPlaybackModeFor(uid, mode);
                      }}
                    >
                      {mode === 'auto' ? 'Авто' : mode === 'screen' ? 'Экр.' : 'Кам.'}
                    </button>
                  ))}
                </div>
              ) : null}
              <span className={styles.streamThumbName}>
                {streams.getStreamRole(uid) === 'screen' ? (
                  <span className={`${styles.streamBadgeMini} ${styles.streamBadgeMiniScreen}`}>Экран</span>
                ) : streams.getStreamRole(uid) === 'camera' ? (
                  <span className={`${styles.streamBadgeMini} ${styles.streamBadgeMiniCam}`}>Камера</span>
                ) : null}{' '}
                {streams.getRemoteName(uid)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function StreamVideo({
  uid,
  playbackMode,
  getPlaybackStream,
  getName,
  videoRef: externalRef,
  isLocal = false,
}: {
  uid: string;
  playbackMode: VideoPlaybackMode;
  getPlaybackStream: (u: string, mode: VideoPlaybackMode) => MediaStream | null;
  getName: (u: string) => string;
  videoRef?: React.MutableRefObject<HTMLVideoElement | null>;
  isLocal?: boolean;
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const ref = (el: HTMLVideoElement | null) => {
    (localRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    if (externalRef) externalRef.current = el;
  };
  const [, setTick] = useState(0);
  useEffect(() => {
    const stream = getPlaybackStream(uid, playbackMode);
    const el = localRef.current;
    if (!el) return;
    const play = () => {
      el.srcObject = stream;
      el.play().catch(() => {});
      setTick((n) => n + 1);
    };
    play();
    if (!stream) {
      return () => {
        el.srcObject = null;
      };
    }
    const onAddTrack = () => play();
    stream.addEventListener('addtrack', onAddTrack);
    stream.addEventListener('removetrack', onAddTrack);
    return () => {
      stream.removeEventListener('addtrack', onAddTrack);
      stream.removeEventListener('removetrack', onAddTrack);
      el.srcObject = null;
    };
  }, [uid, playbackMode, getPlaybackStream]);

  const stream = getPlaybackStream(uid, playbackMode);
  const hasVideo = !!(stream && stream.getVideoTracks().some((t) => t.readyState !== 'ended'));

  return (
    <div className={styles.streamVideoShell}>
      <video ref={ref} autoPlay playsInline muted={isLocal} className={styles.streamVideo} title={getName(uid)} />
      {!hasVideo && (
        <div className={styles.streamPlaceholder}>
          <span className={styles.streamPlaceholderText}>Нет сигнала</span>
        </div>
      )}
    </div>
  );
}

/** Режим «на всю страницу» (viewport вкладки) */
function TheaterPageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6v6H9z" strokeWidth="1.5" />
    </svg>
  );
}

/** Системный полный экран монитора */
function MonitorFullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M8 3H5a2 2 0 0 0-2 2v2m18 0V5a2 2 0 0 0-2-2h-3" />
    </svg>
  );
}

function PiPIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="12" height="10" rx="1" />
      <path d="M16 11h4l2 4v2h-6v-6" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function playJoinSound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // ignore
  }
}

function playLeaveSound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // ignore
  }
}

export default function Ruscord() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: me } = useAuth();
  const [servers, setServers] = useState<RuscordServer[]>([]);
  const [allGuildChannels, setAllGuildChannels] = useState<RuscordGuildChannel[]>([]);
  const [channelsWithMembers, setChannelsWithMembers] = useState<RuscordChannelWithMembers[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [serverChannelIds, setServerChannelIds] = useState<string[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [textMessages, setTextMessages] = useState<RuscordGuildMessage[]>([]);
  const [textDraft, setTextDraft] = useState('');
  const [members, setMembers] = useState<RuscordVoiceMember[]>([]);
  const [, setFriends] = useState<Friend[]>([]);
  const [serverMembers, setServerMembers] = useState<RuscordServerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myCurrentChannelId, setMyCurrentChannelId] = useState<string | null>(null);
  const [muteMic] = useState(() => localStorage.getItem(STORAGE_MUTE_MIC) === '1');
  const [muteSounds] = useState(() => localStorage.getItem(STORAGE_MUTE_SOUNDS) === '1');
  const [micVolume, setMicVolume] = useState(0);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [createServerOpen, setCreateServerOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCodeResult, setInviteCodeResult] = useState<string | null>(null);
  const [acceptInviteOpen, setAcceptInviteOpen] = useState(false);
  const [acceptInviteCode, setAcceptInviteCode] = useState('');
  const [canManageGuild, setCanManageGuild] = useState(false);
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
  const [userSettingsMember, setUserSettingsMember] = useState<RuscordServerMember | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [dragChannelId, setDragChannelId] = useState<string | null>(null);
  const { showToast } = useToast();

  const voiceCtx = useRuscordVoice();
  const setVoicePanel = voiceCtx?.setVoicePanel;
  const setHubSubscriptionChannelIds = voiceCtx?.setHubSubscriptionChannelIds;
  const setHubSubscriptionServerId = voiceCtx?.setHubSubscriptionServerId;
  const registerVoiceHubHandler = voiceCtx?.registerVoiceHubHandler;
  const ruscordLocalLeaveRef = voiceCtx?.ruscordLocalLeaveRef;

  useEffect(() => {
    if (location.hash !== '#active-channel') return;
    const tid = window.setTimeout(() => {
      document.getElementById('active-channel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(tid);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!ruscordLocalLeaveRef) return;
    ruscordLocalLeaveRef.current = (channelId: string) => {
      setMyCurrentChannelId(null);
      setMembers((prev) => prev.filter((m) => m.user_id !== me?.id));
      setChannelsWithMembers((prev) =>
        prev.map((p) =>
          p.channel.id !== channelId ? p : { ...p, members: p.members.filter((m) => m.user_id !== me?.id) }
        )
      );
    };
    return () => {
      ruscordLocalLeaveRef.current = null;
    };
  }, [ruscordLocalLeaveRef, me?.id]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const selectedChannelIdRef = useRef<string | null>(null);
  const selectedServerIdRef = useRef<string | null>(null);
  const fetchServerDataRef = useRef<(serverId: string) => void>(() => {});
  selectedChannelIdRef.current = selectedChannelId;
  selectedServerIdRef.current = selectedServerId;

  const voiceChannels = useMemo(() => channelsWithMembers.map((c) => c.channel), [channelsWithMembers]);
  const voiceUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cwm of channelsWithMembers) {
      for (const m of cwm.members) ids.add(String(m.user_id));
    }
    return ids;
  }, [channelsWithMembers]);
  const categoryChannels = useMemo(
    () => allGuildChannels.filter((c) => c.channel_type === 'category'),
    [allGuildChannels],
  );
  const currentChannelName = myCurrentChannelId
    ? voiceChannels.find((c) => c.id === myCurrentChannelId)?.name ?? allGuildChannels.find((c) => c.id === myCurrentChannelId)?.name ?? 'Канал'
    : '';
  const currentChannelMembers = myCurrentChannelId
    ? (channelsWithMembers.find((c) => c.channel.id === myCurrentChannelId)?.members ?? members)
    : [];

  const fetchServerData = useCallback((serverId: string) => {
    Promise.all([ruscordListServerChannelsFull(serverId), ruscordChannelsWithMembers(serverId)])
      .then(([full, voiceMem]) => {
        setAllGuildChannels(full);
        setChannelsWithMembers(voiceMem);
        setServerChannelIds(full.filter((c) => c.channel_type === 'voice').map((c) => c.id));
      })
      .catch(() => {
        setAllGuildChannels([]);
        setChannelsWithMembers([]);
        setServerChannelIds([]);
      });
  }, []);

  useEffect(() => {
    fetchServerDataRef.current = fetchServerData;
  }, [fetchServerData]);

  useEffect(() => {
    Promise.all([ruscordListServers(), ruscordMe()])
      .then(([serverList, meData]) => {
        setServers(serverList);
        const urlServer = searchParams.get('server');
        const urlChannel = searchParams.get('channel');
        if (urlServer && serverList.some((s) => s.id === urlServer)) {
          setSelectedServerId(urlServer);
          if (urlChannel) setSelectedChannelId(urlChannel);
        } else if (serverList.length > 0 && !selectedServerId) {
          setSelectedServerId(serverList[0].id);
        }
        if (meData.channel_id) setMyCurrentChannelId(meData.channel_id);
      })
      .catch(() => setError('Не удалось загрузить серверы'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedServerId) return;
    setTextMessages([]);
    setServerChannelIds([]);
    fetchServerData(selectedServerId);
  }, [selectedServerId, fetchServerData]);

  useEffect(() => {
    if (!selectedServerId || allGuildChannels.length === 0) return;
    const urlChannel = searchParams.get('channel');
    if (urlChannel && allGuildChannels.some((c) => c.id === urlChannel)) {
      if (selectedChannelId !== urlChannel) setSelectedChannelId(urlChannel);
      return;
    }
    const stored = sessionStorage.getItem(channelStorageKey(selectedServerId));
    if (stored && allGuildChannels.some((c) => c.id === stored)) {
      if (selectedChannelId !== stored) setSelectedChannelId(stored);
      return;
    }
    const inThisServer = channelsWithMembers.some((c) => c.channel.id === myCurrentChannelId);
    if (inThisServer && myCurrentChannelId && !selectedChannelId) setSelectedChannelId(myCurrentChannelId);
  }, [
    selectedServerId,
    allGuildChannels,
    channelsWithMembers,
    myCurrentChannelId,
    selectedChannelId,
    searchParams,
  ]);

  useEffect(() => {
    setHubSubscriptionServerId?.(selectedServerId);
    return () => setHubSubscriptionServerId?.(null);
  }, [selectedServerId, setHubSubscriptionServerId]);

  useEffect(() => {
    if (!selectedChannelId) {
      setMembers([]);
      setTextMessages([]);
      return;
    }
    const meta = allGuildChannels.find((c) => c.id === selectedChannelId);
    if (meta?.channel_type === 'text') {
      ruscordListChannelMessages(selectedChannelId)
        .then(setTextMessages)
        .catch(() => setTextMessages([]));
      ruscordMarkChannelRead(selectedChannelId)
        .then(() => {
          setAllGuildChannels((prev) =>
            prev.map((c) => (c.id === selectedChannelId ? { ...c, unread_count: 0 } : c)),
          );
        })
        .catch(() => {});
      setMembers([]);
      return;
    }
    const cwm = channelsWithMembers.find((c) => c.channel.id === selectedChannelId);
    if (cwm) setMembers(cwm.members);
    else
      ruscordChannelMembers(selectedChannelId)
        .then((list) => {
          setMembers(list);
          if (me?.id && list.some((m) => m.user_id === me.id)) setMyCurrentChannelId(selectedChannelId);
        })
        .catch(() => setMembers([]));
  }, [selectedChannelId, channelsWithMembers, allGuildChannels, me?.id]);

  useEffect(() => {
    getFriends()
      .then(setFriends)
      .catch(() => setFriends([]));
  }, []);

  useEffect(() => {
    if (!selectedServerId) {
      setServerMembers([]);
      return;
    }
    ruscordListServerMembers(selectedServerId)
      .then(setServerMembers)
      .catch(() => setServerMembers([]));
  }, [selectedServerId]);

  useEffect(() => {
    if (!selectedServerId) {
      setCanManageGuild(false);
      return;
    }
    const server = servers.find((s) => s.id === selectedServerId);
    if (server?.owner_id && me?.id && server.owner_id === me.id) {
      setCanManageGuild(true);
      return;
    }
    ruscordListInvites(selectedServerId)
      .then(() => setCanManageGuild(true))
      .catch(() => setCanManageGuild(false));
  }, [selectedServerId, servers, me?.id]);

  const rootChannels = useMemo(() => {
    return [...allGuildChannels]
      .filter((c) => !c.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }, [allGuildChannels]);

  const byParentId = useMemo(() => {
    const map = new Map<string, RuscordGuildChannel[]>();
    for (const c of allGuildChannels) {
      if (!c.parent_id) continue;
      const k = c.parent_id;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    }
    return map;
  }, [allGuildChannels]);

  const onlineMembers = useMemo(
    () => serverMembers.filter((m) => m.is_online),
    [serverMembers],
  );

  const muteSoundsRef = useRef(muteSounds);
  muteSoundsRef.current = muteSounds;
  const meIdRef = useRef(me?.id);
  meIdRef.current = me?.id;
  const myCurrentChannelIdRef = useRef(myCurrentChannelId);
  myCurrentChannelIdRef.current = myCurrentChannelId;
  const allGuildChannelsRef = useRef(allGuildChannels);
  allGuildChannelsRef.current = allGuildChannels;
  const channelsWithMembersRef = useRef(channelsWithMembers);
  channelsWithMembersRef.current = channelsWithMembers;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    if (!setHubSubscriptionChannelIds) return;
    setHubSubscriptionChannelIds(serverChannelIds);
    return () => setHubSubscriptionChannelIds([]);
  }, [serverChannelIds, setHubSubscriptionChannelIds]);

  useEffect(() => {
    if (!registerVoiceHubHandler) return;
    return registerVoiceHubHandler((data: VoiceHubParsedMessage) => {
      try {
        const event = data.event;
        const gid = data.server_id != null ? String(data.server_id) : '';
        if (gid && gid === selectedServerIdRef.current && typeof event === 'string' && event.startsWith('guild_')) {
          if (event === 'guild_message_created') {
            const mid = data.channel_id != null ? String(data.channel_id) : '';
            if (mid && mid === selectedChannelIdRef.current) {
              ruscordListChannelMessages(mid).then(setTextMessages).catch(() => {});
            } else if (mid) {
              setAllGuildChannels((prev) =>
                prev.map((c) =>
                  c.id === mid && c.channel_type === 'text'
                    ? { ...c, unread_count: (c.unread_count ?? 0) + 1 }
                    : c,
                ),
              );
            }
          } else {
            const sid = selectedServerIdRef.current;
            if (sid) fetchServerDataRef.current(sid);
          }
        }

        const cid = data.channel_id != null ? String(data.channel_id).toLowerCase() : null;
        const uid = data.user_id != null ? String(data.user_id) : null;
        const sel = selectedChannelIdRef.current?.toLowerCase() ?? null;
        ruscordLog('hub message', { event, cid, uid, selectedChannelId: sel });

        if (event === 'joined' && cid && uid) {
          const member = {
            user_id: uid,
            email: String(data.email ?? ''),
            name: (data.name as string | null) ?? null,
            joined_at: (data.joined_at as string) ?? new Date().toISOString(),
            mute_mic: false,
            video_enabled: false,
            screen_share_enabled: false,
          };
          const myChannel = myCurrentChannelIdRef.current;
          const imInVoiceOnServer =
            !!myChannel &&
            channelsWithMembersRef.current.some((c) => String(c.channel.id).toLowerCase() === String(myChannel).toLowerCase());
          if (uid !== String(meIdRef.current) && !imInVoiceOnServer) {
            const userLabel = formatDisplayName(member.name, member.email);
            const chName =
              allGuildChannelsRef.current.find((c) => String(c.id).toLowerCase() === cid)?.name ??
              channelsWithMembersRef.current.find((c) => String(c.channel.id).toLowerCase() === cid)?.channel.name ??
              'канал';
            showToastRef.current(`${userLabel} присоединился к ${chName}`);
          }
          if (cid === sel && !muteSoundsRef.current) playJoinSound();
          setChannelsWithMembers((prev) =>
            prev.map((p) => {
              if (String(p.channel.id).toLowerCase() !== cid) return p;
              if (p.members.some((m) => String(m.user_id) === uid)) return p;
              return { ...p, members: [...p.members, member] };
            })
          );
          if (cid === sel) {
            setMembers((prev) => {
              if (prev.some((m) => String(m.user_id) === uid)) return prev;
              return [...prev, member];
            });
          }
          const serverId = selectedServerIdRef.current;
          if (serverId) fetchServerDataRef.current(serverId);
        }

        if (event === 'left' && cid && uid) {
          if (uid === String(meIdRef.current)) {
            setMyCurrentChannelId(null);
            setVoicePanel?.(null);
          }
          if (cid === sel && !muteSoundsRef.current) playLeaveSound();
          setChannelsWithMembers((prev) =>
            prev.map((p) =>
              String(p.channel.id).toLowerCase() !== cid ? p : { ...p, members: p.members.filter((m) => String(m.user_id) !== uid) }
            )
          );
          if (cid === sel) {
            setMembers((prev) => prev.filter((m) => String(m.user_id) !== uid));
          }
          const serverId = selectedServerIdRef.current;
          if (serverId) fetchServerDataRef.current(serverId);
        }

        if (event === 'voice_state_update' && cid && uid) {
          const mute_mic = Boolean(data.mute_mic);
          const video_enabled = Boolean(data.video_enabled);
          const screen_share_enabled = Boolean(data.screen_share_enabled);
          setChannelsWithMembers((prev) =>
            prev.map((p) => {
              if (String(p.channel.id).toLowerCase() !== cid) return p;
              return {
                ...p,
                members: p.members.map((m) =>
                  String(m.user_id) === uid ? { ...m, mute_mic, video_enabled, screen_share_enabled } : m
                ),
              };
            })
          );
          if (cid === sel) {
            setMembers((prev) =>
              prev.map((m) =>
                String(m.user_id) === uid ? { ...m, mute_mic, video_enabled, screen_share_enabled } : m
              )
            );
          }
        }
      } catch (e) {
        ruscordLog('hub handler error', e);
      }
    });
  }, [registerVoiceHubHandler, setVoicePanel]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      ruscordMe()
        .then((d) => {
          if (!d.channel_id) setMyCurrentChannelId(null);
          else setMyCurrentChannelId(d.channel_id);
        })
        .catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  function handleJoin(channelId: string) {
    setError('');
    ruscordJoinChannel(channelId)
      .then(() => {
        setMyCurrentChannelId(channelId);
        setSelectedChannelId(channelId);
        return ruscordChannelMembers(channelId);
      })
      .then((list) => {
        setMembers(list);
        setChannelsWithMembers((prev) =>
          prev.map((p) => (p.channel.id !== channelId ? p : { ...p, members: list }))
        );
        const chName = allGuildChannels.find((c) => c.id === channelId)?.name ?? 'Канал';
        setVoicePanel?.({ channelId, channelName: chName, members: list });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка'));
  }

  function handleLeave(channelId: string) {
    setError('');
    ruscordLeaveChannel(channelId)
      .then(() => {
        setMyCurrentChannelId(null);
        setMembers((prev) => prev.filter((m) => m.user_id !== me?.id));
        setChannelsWithMembers((prev) =>
          prev.map((p) => (p.channel.id !== channelId ? p : { ...p, members: p.members.filter((m) => m.user_id !== me?.id) }))
        );
        setVoicePanel?.(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка'));
  }

  function toggleCategory(catId: string) {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  function selectChannel(channelId: string) {
    setSelectedChannelId(channelId);
    if (selectedServerId) {
      sessionStorage.setItem(channelStorageKey(selectedServerId), channelId);
      navigate(`/dashboard/ruscord?server=${selectedServerId}&channel=${channelId}`, { replace: true });
    }
  }

  function buildReorderPayload(channels: RuscordGuildChannel[]) {
    const byParent = new Map<string | null, RuscordGuildChannel[]>();
    for (const c of channels) {
      const key = c.parent_id;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    }
    const order: { id: string; sort_order: number; parent_id: string | null }[] = [];
    for (const [parentId, group] of byParent) {
      group
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
        .forEach((c, index) => {
          order.push({ id: c.id, sort_order: index, parent_id: parentId });
        });
    }
    return order;
  }

  async function applyChannelReorder(nextChannels: RuscordGuildChannel[]) {
    if (!selectedServerId) return;
    setAllGuildChannels(nextChannels);
    try {
      await ruscordReorderChannels(selectedServerId, buildReorderPayload(nextChannels));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось изменить порядок');
      fetchServerData(selectedServerId);
    }
  }

  function handleChannelDrop(targetId: string) {
    if (!dragChannelId || dragChannelId === targetId || !editMode || !canManageGuild) return;
    const dragged = allGuildChannels.find((c) => c.id === dragChannelId);
    const target = allGuildChannels.find((c) => c.id === targetId);
    if (!dragged || !target) return;
    const parentId = target.parent_id;
    const siblings = allGuildChannels
      .filter((c) => c.parent_id === parentId && c.id !== dragged.id)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    const targetIdx = siblings.findIndex((c) => c.id === targetId);
    const insertAt = targetIdx < 0 ? siblings.length : targetIdx;
    siblings.splice(insertAt, 0, { ...dragged, parent_id: parentId });
    const others = allGuildChannels.filter((c) => c.parent_id !== parentId && c.id !== dragged.id);
    const next = [...others, ...siblings.map((c, i) => ({ ...c, sort_order: i, parent_id: parentId }))];
    setDragChannelId(null);
    void applyChannelReorder(next);
  }

  async function commitChannelRename(channelId: string) {
    const name = renameDraft.trim();
    setEditingChannelId(null);
    if (!name) return;
    const prev = allGuildChannels.find((c) => c.id === channelId);
    if (!prev || prev.name === name) return;
    setError('');
    try {
      await ruscordPatchChannel(channelId, { name });
      setAllGuildChannels((channels) => channels.map((c) => (c.id === channelId ? { ...c, name } : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось переименовать');
    }
  }

  async function handleDeleteChannel(channelId: string) {
    if (!window.confirm('Удалить канал?')) return;
    setError('');
    try {
      await ruscordDeleteChannel(channelId);
      if (selectedChannelId === channelId) setSelectedChannelId(null);
      if (selectedServerId) fetchServerData(selectedServerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить канал');
    }
  }

  function renderChannelRow(ch: RuscordGuildChannel, depth: number) {
    const isSelected = selectedChannelId === ch.id;
    const imInThisChannel = myCurrentChannelId === ch.id;
    const isVoice = ch.channel_type === 'voice';
    const isText = ch.channel_type === 'text';
    const unread = isText ? (ch.unread_count ?? 0) : 0;
    const chMembers = channelsWithMembers.find((x) => x.channel.id === ch.id)?.members ?? [];
    const pad = { paddingLeft: `${8 + depth * 12}px` };
    const isEditing = editingChannelId === ch.id;
    const draggable = editMode && canManageGuild;
    return (
      <li
        key={ch.id}
        className={`${styles.channelRow} ${dragChannelId === ch.id ? styles.channelRowDragging : ''}`}
        draggable={draggable}
        onDragStart={() => draggable && setDragChannelId(ch.id)}
        onDragEnd={() => setDragChannelId(null)}
        onDragOver={(e) => {
          if (draggable && dragChannelId) e.preventDefault();
        }}
        onDrop={() => handleChannelDrop(ch.id)}
      >
        <div
          className={`${styles.channelItem} ${isSelected ? styles.channelItemActive : ''} ${unread > 0 ? styles.channelItemUnread : ''}`}
          style={pad}
          role="button"
          tabIndex={isEditing ? -1 : 0}
          onClick={() => {
            if (!isEditing) selectChannel(ch.id);
          }}
          onKeyDown={(e) => {
            if (isEditing) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectChannel(ch.id);
            }
          }}
        >
          {draggable ? <span className={styles.dragHandle} aria-hidden>⠿</span> : null}
          {isEditing ? (
            <input
              className={styles.channelRenameInput}
              value={renameDraft}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setRenameDraft(e.target.value)}
              onBlur={() => void commitChannelRename(ch.id)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') void commitChannelRename(ch.id);
                if (e.key === 'Escape') setEditingChannelId(null);
              }}
            />
          ) : (
            <span className={styles.channelName}>
              {isText ? <span className={styles.chanGlyph}>#</span> : null}
              {isVoice ? <span className={styles.chanGlyph}>🔊</span> : null}
              <span className={styles.channelNameText}>{ch.name}</span>
              {unread > 0 ? <Badge count={unread} className={styles.channelBadge} /> : null}
            </span>
          )}
          {editMode && canManageGuild && !isEditing ? (
            <div className={styles.channelEditActions} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.channelEditBtn}
                title="Переименовать"
                onClick={() => {
                  setEditingChannelId(ch.id);
                  setRenameDraft(ch.name);
                }}
              >
                ✎
              </button>
              <button type="button" className={styles.channelEditBtnDanger} title="Удалить" onClick={() => void handleDeleteChannel(ch.id)}>
                ×
              </button>
            </div>
          ) : null}
          {isVoice ? (
            imInThisChannel ? (
              <button type="button" className={styles.channelBtn} onClick={(e) => { e.stopPropagation(); handleLeave(ch.id); }}>
                Выйти
              </button>
            ) : (
              <button type="button" className={`${styles.channelBtn} ${styles.channelBtnJoin}`} onClick={(e) => { e.stopPropagation(); handleJoin(ch.id); }}>
                Войти
              </button>
            )
          ) : null}
        </div>
        {isVoice && chMembers.length > 0 ? (
          <ul className={styles.channelMembersUnder}>
            {chMembers.map((m) => (
              <li key={m.user_id} className={styles.channelMemberUnder}>
                <Avatar userId={m.user_id} className={styles.ruscordAvatar} fallbackLetter={m.name?.[0] ?? m.email[0]} size={24} />
                <VoiceMemberIndicators member={m} compact />
                <span>{m.name || m.email}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  function renderCategoryBlock(cat: RuscordGuildChannel) {
    const collapsed = Boolean(collapsedCategories[cat.id]);
    const children = byParentId.get(cat.id) ?? [];
    return (
      <li key={cat.id} className={styles.categoryBlock}>
        <button type="button" className={styles.categoryHeader} onClick={() => toggleCategory(cat.id)}>
          <span className={styles.categoryChevron}>{collapsed ? '▸' : '▾'}</span>
          {cat.name}
        </button>
        {!collapsed ? <ul className={styles.channelListNested}>{children.map((ch) => renderChannelRow(ch, 1))}</ul> : null}
      </li>
    );
  }

  async function submitNewServer() {
    const name = newServerName.trim();
    if (!name) return;
    setError('');
    try {
      const s = await ruscordCreateServer(name);
      setServers((prev) => [...prev, s]);
      setSelectedServerId(s.id);
      setCreateServerOpen(false);
      setNewServerName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать сервер');
    }
  }

  async function submitCreateInvite() {
    if (!selectedServerId) return;
    setError('');
    try {
      const inv = await ruscordCreateInvite(selectedServerId);
      setInviteCodeResult(inv.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать приглашение');
    }
  }

  async function submitAcceptInvite() {
    const code = acceptInviteCode.trim();
    if (!code) return;
    setError('');
    try {
      const s = await ruscordAcceptInvite(code);
      setServers((prev) => {
        if (prev.some((x) => x.id === s.id)) return prev;
        return [...prev, s];
      });
      setSelectedServerId(s.id);
      setAcceptInviteOpen(false);
      setAcceptInviteCode('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Код недействителен');
    }
  }

  async function submitTextMessage() {
    const t = textDraft.trim();
    if (!selectedChannelId || !t) return;
    setError('');
    try {
      const msg = await ruscordPostChannelMessage(selectedChannelId, t);
      setTextDraft('');
      setTextMessages((prev) => [...prev, msg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не отправить сообщение');
    }
  }

  useEffect(() => {
    if (!myCurrentChannelId || muteMic) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
      if (analyserRef.current) analyserRef.current = null;
      setMicVolume(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    let cancelled = false;
    const md = navigator.mediaDevices;
    if (!md?.getUserMedia) {
      setMicVolume(0);
      return;
    }
    md
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);

        function tick() {
          if (cancelled || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length / 255;
          setMicVolume(avg);
          animationRef.current = requestAnimationFrame(tick);
        }
        tick();
      })
      .catch(() => setMicVolume(0));
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [myCurrentChannelId, muteMic]);

  useEffect(() => {
    if (!setVoicePanel) return;
    if (!myCurrentChannelId) return;
    setVoicePanel({
      channelId: myCurrentChannelId,
      channelName: currentChannelName,
      members: currentChannelMembers,
      volume: micVolume,
    });
  }, [setVoicePanel, myCurrentChannelId, currentChannelName, currentChannelMembers, micVolume]);

  if (loading) return <p className={styles.loading}>Загрузка…</p>;

  const currentServer = servers.find((s) => s.id === selectedServerId);
  const selectedMeta = selectedChannelId ? allGuildChannels.find((c) => c.id === selectedChannelId) : undefined;
  const centerIsText = selectedMeta?.channel_type === 'text';

  const micApiMissing =
    typeof navigator !== 'undefined' &&
    Boolean(myCurrentChannelId) &&
    !muteMic &&
    !navigator.mediaDevices?.getUserMedia;

  const notSecureContext =
    typeof window !== 'undefined' && !window.isSecureContext && window.location.protocol === 'http:';

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      {notSecureContext ? (
        <p className={styles.micHint} role="status">
          Голос и демонстрация экрана в браузерах (Chrome, Brave, Яндекс и др.) требуют безопасный контекст
          (HTTPS или localhost). По HTTP с IP микрофон и экран могут быть недоступны. Запустите фронт через{' '}
          <code className={styles.codeInline}>npm run dev:https</code> или используйте HTTPS-прокси; см. README.
        </p>
      ) : null}
      {micApiMissing ? (
        <p className={styles.micHint}>
          Микрофон недоступен в этом контексте (нет navigator.mediaDevices). Откройте сайт по HTTPS или с
          адреса localhost.
        </p>
      ) : null}

      {createServerOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setCreateServerOpen(false)}>
          <div className={styles.modalCard} role="dialog" aria-labelledby="create-server-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="create-server-title" className={styles.modalTitle}>
              Новый сервер
            </h2>
            <label className={styles.modalLabel}>
              Название
              <input
                className={styles.modalInput}
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                placeholder="Мой сервер"
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtnSecondary} onClick={() => setCreateServerOpen(false)}>
                Отмена
              </button>
              <button type="button" className={styles.modalBtnPrimary} onClick={() => void submitNewServer()}>
                Создать
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {inviteModalOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => { setInviteModalOpen(false); setInviteCodeResult(null); }}>
          <div className={styles.modalCard} role="dialog" aria-labelledby="invite-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="invite-title" className={styles.modalTitle}>
              Приглашение
            </h2>
            {!inviteCodeResult ? (
              <p className={styles.modalHint}>Создать одноразовую ссылку с кодом для входа на сервер.</p>
            ) : (
              <div>
                <p className={styles.modalHint}>Код:</p>
                <code className={styles.inviteCodeBox}>{inviteCodeResult}</code>
                <p className={styles.modalHint}>Ссылка для друга (после входа в аккаунт):</p>
                <code className={styles.inviteCodeBox}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/dashboard/ruscord` : ''}
                </code>
              </div>
            )}
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtnSecondary} onClick={() => { setInviteModalOpen(false); setInviteCodeResult(null); }}>
                Закрыть
              </button>
              {!inviteCodeResult ? (
                <button type="button" className={styles.modalBtnPrimary} onClick={() => void submitCreateInvite()}>
                  Создать код
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {acceptInviteOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setAcceptInviteOpen(false)}>
          <div className={styles.modalCard} role="dialog" aria-labelledby="accept-invite-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="accept-invite-title" className={styles.modalTitle}>
              Вступить по коду
            </h2>
            <label className={styles.modalLabel}>
              Код приглашения
              <input
                className={styles.modalInput}
                value={acceptInviteCode}
                onChange={(e) => setAcceptInviteCode(e.target.value)}
                placeholder="вставьте код"
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtnSecondary} onClick={() => setAcceptInviteOpen(false)}>
                Отмена
              </button>
              <button type="button" className={styles.modalBtnPrimary} onClick={() => void submitAcceptInvite()}>
                Вступить
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {serverSettingsOpen && currentServer ? (
        <ServerSettingsModal
          server={currentServer}
          canManage={canManageGuild}
          editMode={editMode}
          categoryChannels={categoryChannels}
          onClose={() => setServerSettingsOpen(false)}
          onServerUpdated={(s) => setServers((prev) => prev.map((x) => (x.id === s.id ? s : x)))}
          onEditModeChange={setEditMode}
          onChannelCreated={() => selectedServerId && fetchServerData(selectedServerId)}
        />
      ) : null}

      {userSettingsMember ? (
        <UserSettingsModal
          userId={userSettingsMember.user_id}
          userName={userSettingsMember.name}
          userEmail={userSettingsMember.email}
          chatId={currentServer?.chat_id ?? null}
          onClose={() => setUserSettingsMember(null)}
        />
      ) : null}

      <nav className={styles.serverRailTop} aria-label="Серверы">
        <ul className={styles.serverRailList}>
          {servers.map((s) => (
            <li key={s.id} className={styles.serverRailItem}>
              <button
                type="button"
                className={`${styles.serverIconBtn} ${selectedServerId === s.id ? styles.serverIconBtnActive : ''}`}
                title={s.name}
                onClick={() => setSelectedServerId(s.id)}
              >
                <RuscordServerIcon
                  serverId={s.id}
                  hasIcon={s.has_icon}
                  fallbackLetter={(s.name || '?')[0]}
                  className={styles.serverIconImg}
                />
              </button>
            </li>
          ))}
          <li className={styles.serverRailItem}>
            <button type="button" className={styles.serverIconBtnAdd} title="Создать сервер" onClick={() => setCreateServerOpen(true)}>
              +
            </button>
          </li>
          <li className={styles.serverRailItem}>
            <button type="button" className={styles.serverIconBtnAdd} title="Вступить по приглашению" onClick={() => setAcceptInviteOpen(true)}>
              ↵
            </button>
          </li>
        </ul>
      </nav>

      <header className={styles.serverTitleRow}>
        {currentServer ? (
          <button
            type="button"
            className={styles.serverTitleBtn}
            title="Настройки сервера"
            aria-label="Настройки сервера"
            onClick={() => setServerSettingsOpen(true)}
          >
            <h2 className={styles.serverTitle}>{currentServer.name}</h2>
            <span className={styles.serverGearBtn} aria-hidden>
              <IconSettings size={18} />
            </span>
          </button>
        ) : (
          <h2 className={styles.serverTitle}>Сервер</h2>
        )}
        {editMode ? <span className={styles.editModeBadge}>Режим редактирования</span> : null}
      </header>

      <div className={styles.discordShell}>
        <div className={styles.layout}>
          <section className={styles.serversBlock}>
            <ul className={styles.channelList}>
              {rootChannels.map((ch) => {
                if (ch.channel_type === 'category') return renderCategoryBlock(ch);
                return renderChannelRow(ch, 0);
              })}
            </ul>
          </section>

          <section className={styles.mainColumn}>
            {centerIsText && selectedChannelId ? (
              <div className={styles.textChannelPanel}>
                <header className={styles.textChannelHead}>
                  <span className={styles.chanGlyph}>#</span>
                  <span>{selectedMeta?.name ?? 'канал'}</span>
                </header>
                <div className={styles.messageList}>
                  {textMessages.map((m) => {
                    const authorColor = m.author_message_color || '#ffffff';
                    return (
                      <div key={m.id} className={styles.messageRow}>
                        <Avatar
                          userId={m.author_id}
                          className={styles.ruscordAvatar}
                          fallbackLetter={m.author_name?.[0] ?? m.author_email[0]}
                          size={36}
                        />
                        <div>
                          <div className={styles.messageMeta}>
                            <strong style={{ color: authorColor }}>{m.author_name || m.author_email}</strong>
                            <span className={styles.messageTime}>{new Date(m.created_at).toLocaleString()}</span>
                          </div>
                          <div className={styles.messageBody}>{m.content}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.messageComposer}>
                  <input
                    className={styles.messageInput}
                    placeholder={`Написать в #${selectedMeta?.name ?? 'канал'}`}
                    value={textDraft}
                    onChange={(e) => setTextDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void submitTextMessage();
                      }
                    }}
                  />
                  <button type="button" className={styles.modalBtnPrimary} onClick={() => void submitTextMessage()}>
                    Отправить
                  </button>
                </div>
              </div>
            ) : (
              <ActiveChannelStreams />
            )}
          </section>

          <section className={styles.onlineBlock}>
            <h2 className={styles.friendsTitle}>Участники</h2>
            {!selectedServerId && <p className={styles.emptyHint}>Выберите сервер</p>}
            {selectedServerId && serverMembers.length === 0 && <p className={styles.emptyHint}>Нет участников</p>}
            {selectedServerId && serverMembers.length > 0 ? (
              <>
                <h3 className={styles.membersSectionTitle}>Online — {onlineMembers.length}</h3>
                <ul className={styles.friendList}>
                  {onlineMembers.length === 0 ? (
                    <li className={styles.emptyHint}>Никого нет в сети</li>
                  ) : (
                    onlineMembers.map((m) => {
                      const label = m.nickname ?? formatDisplayName(m.name, m.email);
                      const inVoice = voiceUserIds.has(String(m.user_id));
                      return (
                        <li key={`online-${m.user_id}`}>
                          <button
                            type="button"
                            className={`${styles.friendItem} ${styles.friendItemClickable}`}
                            onClick={() => setUserSettingsMember(m)}
                          >
                            <Avatar userId={m.user_id} className={styles.ruscordAvatar} fallbackLetter={label[0]} size={32} />
                            {inVoice ? <span className={styles.onlineDot} title="В голосовом канале" aria-hidden /> : null}
                            <span>{label}</span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
                <h3 className={styles.membersSectionTitle}>All — {serverMembers.length}</h3>
                <ul className={styles.friendList}>
                  {serverMembers.map((m) => {
                    const label = m.nickname ?? formatDisplayName(m.name, m.email);
                    const inVoice = voiceUserIds.has(String(m.user_id));
                    return (
                      <li key={m.user_id}>
                        <button
                          type="button"
                          className={`${styles.friendItem} ${styles.friendItemClickable}`}
                          onClick={() => setUserSettingsMember(m)}
                        >
                          <Avatar userId={m.user_id} className={styles.ruscordAvatar} fallbackLetter={label[0]} size={32} />
                          {inVoice ? <span className={styles.onlineDot} title="В голосовом канале" aria-hidden /> : null}
                          <span>{label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
