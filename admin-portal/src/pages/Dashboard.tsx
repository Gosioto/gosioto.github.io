import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { usePresence } from '../hooks/usePresence';
import {
  getModules,
  getDashboardStats,
  getPermissions,
  ruscordMe,
  ruscordLeaveChannel,
  ruscordPatchVoiceState,
  type ModuleInfo,
  type DashboardStats,
  type PermissionGroup,
  type User,
} from '../api';
import { drainPendingIce, enqueuePendingIce } from '../voice/iceQueue';
import {
  diagnoseDisplayMediaFailure,
  diagnoseDisplayMediaUnavailable,
} from '../voice/voiceDiagnose';
import { buildVoiceRtcConfiguration } from '../voice/rtcConfig';
import { voiceLog, voiceLogEnabled } from '../voiceLog';
import {
  RuscordVoiceProvider,
  type VoicePanelData,
  type VoicePanelUpdate,
  type VoiceHubParsedMessage,
  type StreamRole,
  type VideoPlaybackMode,
  type VoiceRtcStatus,
  type VoiceUserFacingError,
} from '../RuscordVoiceContext';
import { classifyVideoTrack, pickVideoTrackFromStream } from '../voice/videoTrackPick';
import { isPolitePeer } from '../voice/meshNegotiation';
import { aggregateVoiceRtcStatus } from '../voice/voiceRtcAggregate';
import { applyOutboundRtpPolicies } from '../voice/mediaSenderPolicy';
import { wsUrl } from '../apiConfig';
import { SpotlightCard, DotWaveLoader, useToast } from '../ui';
import Roles from './Roles';
import Users from './Users';
import Chats from './Chats';
import ChatRoom from './ChatRoom';
import Ruscord from './Ruscord';
import Settings from './Settings';
import Friends from './Friends';
import Sessions from './Sessions';
import { useIsMobile } from '../hooks/useMediaQuery';
import AppShell from '../layout/AppShell';
import BottomNav from '../layout/BottomNav';
import Sidebar from '../layout/Sidebar';
import VoiceBar from '../layout/VoiceBar';
import { ADMIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../layout/navConfig';
import { ChatUnreadProvider, useChatUnread } from '../context/ChatUnreadContext';
import { useChatNotifications, dispatchChatUnreadToast, type ChatUnreadWsPayload } from '../hooks/useChatNotifications';
import { useRuscordNotifications, dispatchRuscordUnreadToast, type RuscordUnreadWsPayload } from '../hooks/useRuscordNotifications';
import styles from './Dashboard.module.css';

function canSeeSection(permission: string, userPermissions: string[] | null | undefined): boolean {
  return Boolean(userPermissions?.includes(permission));
}

const STORAGE_USER_VOLUMES = 'ruscord_user_volumes';

export default function Dashboard() {
  return (
    <ChatUnreadProvider>
      <DashboardContent />
    </ChatUnreadProvider>
  );
}

function DashboardContent() {
  const { user, logout, token, refreshUser } = useAuth();
  usePresence(token);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { totalUnread } = useChatUnread();
  useChatNotifications();
  useRuscordNotifications();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [servicesOpen, setServicesOpen] = useState(true);

  type VoiceState = {
    channelId: string;
    channelName: string;
    members: import('../api').RuscordVoiceMember[];
    muteMic: boolean;
    muteSounds: boolean;
    volume: number;
    userVolumes: Record<string, number>;
    videoEnabled: boolean;
    screenShareEnabled: boolean;
    transmissionEnabled: boolean;
  };
  const [voiceState, setVoiceState] = useState<VoiceState | null>(null);
  const [micStreamReady, setMicStreamReady] = useState(false);
  /** Смена локальных/удалённых потоков — обновить привязку video srcObject в Ruscord. */
  const [mediaEpoch, setMediaEpoch] = useState(0);
  const bumpMediaEpoch = useCallback(() => setMediaEpoch((n) => n + 1), []);
  const voiceStateRef = useRef<VoiceState | null>(null);
  voiceStateRef.current = voiceState;

  const [hubSubscriptionChannelIds, setHubSubscriptionChannelIds] = useState<string[]>([]);
  const [hubSubscriptionServerId, setHubSubscriptionServerId] = useState<string | null>(null);
  const hubSubscriptionKey = useMemo(
    () =>
      `${hubSubscriptionServerId ?? ''}|${[...hubSubscriptionChannelIds]
        .map((id) => String(id))
        .sort()
        .join(',')}`,
    [hubSubscriptionChannelIds, hubSubscriptionServerId]
  );
  const ruscordLocalLeaveRef = useRef<((channelId: string) => void) | null>(null);

  const voiceHubHandlersRef = useRef(new Set<(data: VoiceHubParsedMessage) => void>());
  const registerVoiceHubHandler = useCallback((handler: (data: VoiceHubParsedMessage) => void) => {
    voiceHubHandlersRef.current.add(handler);
    return () => {
      voiceHubHandlersRef.current.delete(handler);
    };
  }, []);

  const [screenShareUserHint, setScreenShareUserHint] = useState<string | null>(null);
  const [voiceRtcStatus, setVoiceRtcStatus] = useState<VoiceRtcStatus | null>(null);
  const [voiceUserFacingError, setVoiceUserFacingError] = useState<VoiceUserFacingError | null>(null);
  const dismissVoiceUserFacingError = useCallback(() => setVoiceUserFacingError(null), []);

  const setVoicePanel = useCallback((data: VoicePanelUpdate) => {
      if (typeof data === 'function') {
        const prev = voiceStateRef.current
          ? {
              ...voiceStateRef.current,
              leaveChannel: () => {},
              setMuteMic: () => {},
              setMuteSounds: () => {},
              setUserVolume: () => {},
              setVideoEnabled: () => {},
              setScreenShareEnabled: () => {},
              setTransmissionEnabled: () => {},
              videoEnabled: voiceStateRef.current.videoEnabled ?? false,
              screenShareEnabled: voiceStateRef.current.screenShareEnabled ?? false,
              transmissionEnabled: voiceStateRef.current.transmissionEnabled ?? true,
            }
          : null;
        const next = (data as (p: VoicePanelData | null) => VoicePanelData | null)(prev);
        if (!next) setVoiceState(null);
        else
          setVoiceState({
            channelId: next.channelId,
            channelName: next.channelName,
            members: next.members,
            muteMic: next.muteMic,
            muteSounds: next.muteSounds,
            volume: next.volume,
            userVolumes: next.userVolumes ?? {},
            videoEnabled: next.videoEnabled ?? false,
            screenShareEnabled: next.screenShareEnabled ?? false,
            transmissionEnabled: next.transmissionEnabled ?? true,
          });
        return;
      }
      if (!data) {
        setVoiceState(null);
        return;
      }
      const hasCallbacks = 'leaveChannel' in data && typeof (data as VoicePanelData).leaveChannel === 'function';
      if (hasCallbacks) {
        const d = data as VoicePanelData;
        setVoiceState({
          channelId: d.channelId,
          channelName: d.channelName,
          members: d.members,
          muteMic: d.muteMic,
          muteSounds: d.muteSounds,
          volume: d.volume,
          userVolumes: d.userVolumes ?? {},
          videoEnabled: d.videoEnabled ?? false,
          screenShareEnabled: d.screenShareEnabled ?? false,
          transmissionEnabled: d.transmissionEnabled ?? true,
        });
        return;
      }
      const patch = data as Partial<VoiceState>;
      setVoiceState((prev) => {
        const storedMic = localStorage.getItem('ruscord_mute_mic') === '1';
        const storedSounds = localStorage.getItem('ruscord_mute_sounds') === '1';
        let userVolumes: Record<string, number> = {};
        try {
          const raw = localStorage.getItem(STORAGE_USER_VOLUMES);
          if (raw) userVolumes = JSON.parse(raw);
        } catch {
          // ignore
        }
        if (!prev) {
          return {
            channelId: patch.channelId!,
            channelName: patch.channelName ?? 'Канал',
            members: patch.members ?? [],
            muteMic: patch.muteMic ?? storedMic,
            muteSounds: patch.muteSounds ?? storedSounds,
            volume: patch.volume ?? 0,
            userVolumes: patch.userVolumes ?? userVolumes,
            videoEnabled: patch.videoEnabled ?? false,
            screenShareEnabled: patch.screenShareEnabled ?? false,
            transmissionEnabled: patch.transmissionEnabled ?? true,
          };
        }
        return { ...prev, ...patch };
      });
    },
    []
  );

  const leaveChannel = useCallback(() => {
    const s = voiceStateRef.current;
    if (!s?.channelId) return;
    const cid = s.channelId;
    // Сначала сбросить состояние Ruscord.tsx — иначе его эффект sync вызовет setVoicePanel и вернёт панель.
    ruscordLocalLeaveRef.current?.(cid);
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setVoiceState(null);
    ruscordLeaveChannel(cid).catch(() => {});
  }, []);

  const setMuteMic = useCallback((v: boolean) => {
    localStorage.setItem('ruscord_mute_mic', v ? '1' : '0');
    setVoiceState((prev) => (prev ? { ...prev, muteMic: v } : null));
    const cid = voiceStateRef.current?.channelId;
    if (cid) ruscordPatchVoiceState(cid, { mute_mic: v }).catch(() => {});
  }, []);

  const setMuteSounds = useCallback((v: boolean) => {
    localStorage.setItem('ruscord_mute_sounds', v ? '1' : '0');
    setVoiceState((prev) => (prev ? { ...prev, muteSounds: v } : null));
  }, []);

  const setVideoEnabled = useCallback((v: boolean) => {
    setVoiceState((prev) => (prev ? { ...prev, videoEnabled: v } : null));
    const cid = voiceStateRef.current?.channelId;
    if (cid) ruscordPatchVoiceState(cid, { video_enabled: v }).catch(() => {});
  }, []);

  const setScreenShareEnabled = useCallback(
    (v: boolean) => {
      if (v) {
        setScreenShareUserHint(null);
        if (!navigator.mediaDevices?.getDisplayMedia) {
          const d = diagnoseDisplayMediaUnavailable();
          voiceLog('screen_share_blocked', d);
          setScreenShareUserHint(`${d.likelyCause} ${d.suggestedFix}`);
          setVoiceState((prev) => (prev ? { ...prev, screenShareEnabled: false } : null));
          return;
        }
        navigator.mediaDevices
          .getDisplayMedia({
            video: {
              frameRate: { max: 30 },
              width: { max: 1920 },
              height: { max: 1080 },
            },
            audio: false,
          })
          .then((screenStream) => {
            screenStreamRef.current = screenStream;
            screenStream.getVideoTracks().forEach((t) => {
              try {
                t.contentHint = 'detail';
              } catch {
                /* ignore */
              }
            });
            bumpMediaEpoch();
            setScreenShareUserHint(null);
            voiceLog('screen share stream obtained', screenStream.getVideoTracks().length, 'video track(s)');
            screenStream.getVideoTracks()[0]?.addEventListener('ended', () => {
              setVoiceState((p) => (p ? { ...p, screenShareEnabled: false } : null));
            });
            setVoiceState((prev) => (prev ? { ...prev, screenShareEnabled: true } : null));
            const cid = voiceStateRef.current?.channelId;
            if (cid) ruscordPatchVoiceState(cid, { screen_share_enabled: true }).catch(() => {});
          })
          .catch((err) => {
            const d = diagnoseDisplayMediaFailure(err);
            voiceLog('getDisplayMedia failed', err, d);
            setScreenShareUserHint(`${d.likelyCause} ${d.suggestedFix}`);
            setVoiceState((prev) => (prev ? { ...prev, screenShareEnabled: false } : null));
          });
        return;
      }
      if (screenStreamRef.current) {
        const screenStream = screenStreamRef.current;
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.entries(peerConnectionsRef.current).forEach(([uid, pc]) => {
          const senders = pc.getSenders();
          const screenSender = screenTrack ? senders.find((s) => s.track === screenTrack) : senders.find((s) => s.track?.kind === 'video');
          if (screenSender) pc.removeTrack(screenSender);
          pc.createOffer().then((offer) => {
            pc.setLocalDescription(offer);
            sendSignalRef.current(uid, { type: 'offer', sdp: offer.sdp });
          }).catch(() => {});
        });
        screenStream.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
        bumpMediaEpoch();
      }
      setScreenShareUserHint(null);
      setVoiceState((prev) => (prev ? { ...prev, screenShareEnabled: false } : null));
      const cid = voiceStateRef.current?.channelId;
      if (cid) ruscordPatchVoiceState(cid, { screen_share_enabled: false }).catch(() => {});
    },
    [bumpMediaEpoch]
  );

  const setTransmissionEnabled = useCallback((v: boolean) => {
    setVoiceState((prev) => (prev ? { ...prev, transmissionEnabled: v } : null));
  }, []);

  const setUserVolume = useCallback((userId: string, value: number) => {
    setVoiceState((prev) => {
      if (!prev) return null;
      const next = { ...prev, userVolumes: { ...prev.userVolumes, [userId]: value } };
      try {
        localStorage.setItem(STORAGE_USER_VOLUMES, JSON.stringify(next.userVolumes));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const voicePanel: VoicePanelData | null =
    voiceState === null
      ? null
      : {
          ...voiceState,
          leaveChannel,
          setMuteMic,
          setMuteSounds,
          setUserVolume,
          videoEnabled: voiceState.videoEnabled ?? false,
          setVideoEnabled,
          screenShareEnabled: voiceState.screenShareEnabled ?? false,
          setScreenShareEnabled,
          transmissionEnabled: voiceState.transmissionEnabled ?? true,
          setTransmissionEnabled,
        };

  const adminSectionsVisible = ADMIN_NAV_ITEMS.filter((s) => canSeeSection(s.permission!, user?.permissions));
  const bottomNavItems = BOTTOM_NAV_ITEMS.filter(
    (item) => !item.permission || canSeeSection(item.permission, user?.permissions)
  );
  const chatUnreadByPath = { '/dashboard/chats': totalUnread };

  useEffect(() => {
    if (!user) return;
    ruscordMe()
      .then((data) => {
        if (!data.channel_id || !data.channel_name) return;
        const storedMic = localStorage.getItem('ruscord_mute_mic') === '1';
        const storedSounds = localStorage.getItem('ruscord_mute_sounds') === '1';
        let userVolumes: Record<string, number> = {};
        try {
          const raw = localStorage.getItem('ruscord_user_volumes');
          if (raw) userVolumes = JSON.parse(raw);
        } catch {
          // ignore
        }
        const meMember = (data.members ?? []).find((m: { user_id: string }) => m.user_id === user?.id);
        setVoiceState({
          channelId: data.channel_id,
          channelName: data.channel_name,
          members: data.members ?? [],
          muteMic: storedMic,
          muteSounds: storedSounds,
          volume: 0,
          userVolumes,
          videoEnabled: meMember?.video_enabled ?? false,
          screenShareEnabled: meMember?.screen_share_enabled ?? false,
          transmissionEnabled: true,
        });
      })
      .catch(() => {});
  }, [user?.id]);

  const wsRef = useRef<WebSocket | null>(null);
  const signalHandlerRef = useRef<((fromUserId: string, payload: unknown) => void) | null>(null);
  const sendSignalRef = useRef<(toUserId: string, payload: object) => void>(() => {});
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  /** Не чаще одного iceRestart на пира за интервал (мс). */
  const lastIceRestartAtRef = useRef<Record<string, number>>({});
  /** Попытки восстановления ICE подряд (сброс при connected/completed). */
  const recoveryAttemptsRef = useRef<Record<string, number>>({});
  /** ICE-кандидаты, пришедшие до offer/answer; применяются после setRemoteDescription */
  const pendingIceCandidatesRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
  const remoteAudiosRef = useRef<Record<string, HTMLAudioElement>>({});
  const remoteVideoStreamsRef = useRef<Record<string, MediaStream>>({});
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [remoteVideoUserIds, setRemoteVideoUserIds] = useState<string[]>([]);

  const localUidStr = user?.id != null ? String(user.id) : '';
  const hasLocalVideoTile =
    !!voiceState?.channelId &&
    voiceState.transmissionEnabled &&
    (((voiceState.videoEnabled && micStreamReady) || voiceState.screenShareEnabled));
  const videoTileUserIds = useMemo(() => {
    const ids = [...remoteVideoUserIds];
    if (hasLocalVideoTile && localUidStr && !ids.includes(localUidStr)) ids.push(localUidStr);
    return ids;
  }, [remoteVideoUserIds, hasLocalVideoTile, localUidStr]);

  const getRemotePlaybackStream = useCallback(
    (uid: string, mode: VideoPlaybackMode): MediaStream | null => {
      if (localUidStr && uid === localUidStr) {
        const screen = screenStreamRef.current;
        const mic = micStreamRef.current;
        const screenTrack = screen?.getVideoTracks().find((t) => t.readyState !== 'ended');
        const camTrack = mic?.getVideoTracks().find((t) => t.readyState !== 'ended');
        if (mode === 'screen') {
          return screenTrack ? new MediaStream([screenTrack]) : null;
        }
        if (mode === 'camera') {
          return camTrack ? new MediaStream([camTrack]) : null;
        }
        if (screenTrack) return new MediaStream([screenTrack]);
        if (camTrack) return new MediaStream([camTrack]);
        return null;
      }
      const raw = remoteVideoStreamsRef.current[uid] ?? null;
      const m = voiceStateRef.current?.members?.find((x) => String(x.user_id) === String(uid));
      const hint = {
        screenPreferred: !!m?.screen_share_enabled,
        cameraPreferred: !!(m?.video_enabled && !m?.screen_share_enabled),
      };
      const track = pickVideoTrackFromStream(raw, mode, hint);
      return track ? new MediaStream([track]) : null;
    },
    [localUidStr, remoteVideoUserIds, mediaEpoch]
  );

  const getPlaybackSources = useCallback(
    (uid: string): ('screen' | 'camera')[] => {
      if (localUidStr && uid === localUidStr) {
        const out: ('screen' | 'camera')[] = [];
        if (screenStreamRef.current?.getVideoTracks().some((t) => t.readyState !== 'ended')) out.push('screen');
        if (micStreamRef.current?.getVideoTracks().some((t) => t.readyState !== 'ended')) out.push('camera');
        return out;
      }
      const raw = remoteVideoStreamsRef.current[uid];
      if (!raw) return [];
      const kinds = new Set<'screen' | 'camera'>();
      for (const t of raw.getVideoTracks()) {
        if (t.readyState === 'ended') continue;
        kinds.add(classifyVideoTrack(t));
      }
      const order: ('screen' | 'camera')[] = [];
      if (kinds.has('screen')) order.push('screen');
      if (kinds.has('camera')) order.push('camera');
      return order;
    },
    [localUidStr, remoteVideoUserIds, mediaEpoch]
  );

  const getRemoteStream = useCallback(
    (uid: string) => getRemotePlaybackStream(uid, 'auto'),
    [getRemotePlaybackStream]
  );
  const getRemoteName = useCallback(
    (uid: string) => {
      if (localUidStr && uid === localUidStr) return 'Вы';
      const m = voiceStateRef.current?.members?.find((x) => String(x.user_id) === String(uid));
      return m?.name ?? m?.email ?? uid;
    },
    [localUidStr]
  );
  const setRemoteAudioMuted = useCallback(
    (uid: string, muted: boolean) => {
      if (localUidStr && uid === localUidStr) return;
      const audio = remoteAudiosRef.current[uid];
      if (audio) audio.muted = muted;
    },
    [localUidStr]
  );

  const getStreamRole = useCallback(
    (uid: string): StreamRole => {
      if (localUidStr && uid === localUidStr) {
        if (screenStreamRef.current?.getVideoTracks()[0]) return 'screen';
        if (micStreamRef.current?.getVideoTracks()[0]) return 'camera';
        return 'none';
      }
      const m = voiceStateRef.current?.members?.find((x) => String(x.user_id) === String(uid));
      if (!m) return 'none';
      if (m.screen_share_enabled) return 'screen';
      if (m.video_enabled) return 'camera';
      return 'none';
    },
    [localUidStr, mediaEpoch, remoteVideoUserIds]
  );

  const streamsContext =
    voiceState?.channelId
      ? {
          remoteVideoUserIds: videoTileUserIds,
          mediaEpoch,
          getRemoteStream,
          getRemotePlaybackStream,
          getPlaybackSources,
          getRemoteName,
          getStreamRole,
          setRemoteAudioMuted,
        }
      : null;

  useEffect(() => {
    if (voiceRtcStatus?.phase === 'rtc_ok' && voiceUserFacingError) {
      setVoiceUserFacingError(null);
    }
  }, [voiceRtcStatus?.phase, voiceUserFacingError]);

  useEffect(() => {
    if (!voiceState?.channelId || !voiceState.transmissionEnabled || !micStreamReady) {
      setVoiceRtcStatus(null);
      return;
    }
    const tick = () => {
      const others =
        voiceStateRef.current?.members?.filter((m) => String(m.user_id) !== String(user?.id)) ?? [];
      const otherIds = others.map((m) => m.user_id);
      setVoiceRtcStatus(
        aggregateVoiceRtcStatus(
          otherIds,
          (uid) => peerConnectionsRef.current[uid],
          (uid) => !!remoteAudiosRef.current[uid],
        ),
      );
    };
    tick();
    const id = window.setInterval(tick, 400);
    return () => clearInterval(id);
  }, [voiceState?.channelId, voiceState?.transmissionEnabled, micStreamReady, user?.id]);

  useEffect(() => {
    if (!token) return;
    const voiceCid = voiceState?.channelId ?? '';
    const uniqueIds = [...new Set([...(voiceCid ? [voiceCid] : []), ...hubSubscriptionChannelIds])];
    const serverSid = (hubSubscriptionServerId ?? '').trim();

    let cancelled = false;
    let ws: WebSocket | null = null;
    const DEBOUNCE_MS = 220;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const wsUrlStr = wsUrl(`token=${encodeURIComponent(token)}`);
      ws = new WebSocket(wsUrlStr);
      wsRef.current = ws;
      ws.onopen = () => {
        voiceLog('WS open', { channel_ids: uniqueIds, server_id: serverSid || undefined });
        if (uniqueIds.length > 0) {
          uniqueIds.forEach((id) => {
            ws!.send(JSON.stringify({ type: 'subscribe_voice', channel_id: id }));
          });
        } else if (serverSid) {
          ws!.send(JSON.stringify({ type: 'subscribe_ruscord_server', server_id: serverSid }));
        }
        if (uniqueIds.length > 0 && serverSid) {
          ws!.send(JSON.stringify({ type: 'subscribe_ruscord_server', server_id: serverSid }));
        }
      };
      ws.onmessage = (event) => {
        try {
        const data = JSON.parse(event.data) as VoiceHubParsedMessage;
        if (data.type === 'account_blocked') {
          showToast('Доступ ограничен', 'Ваш аккаунт заблокирован', 'error');
          logout();
          return;
        }
        if (data.type === 'permissions_changed') {
          void refreshUser();
          return;
        }
        if (data.type === 'chat_unread') {
          dispatchChatUnreadToast(data as ChatUnreadWsPayload);
          return;
        }
        if (data.type === 'ruscord_unread') {
          dispatchRuscordUnreadToast(data as RuscordUnreadWsPayload);
          return;
        }
        for (const fn of voiceHubHandlersRef.current) {
          try {
            fn(data);
          } catch (e) {
            voiceLog('voice hub handler error', e);
          }
        }
        const msgChannelId = data.channel_id != null ? String(data.channel_id).toLowerCase() : null;
        const ourCid = (voiceStateRef.current?.channelId ?? voiceCid ?? '').toLowerCase();
        const eventType = data.event ?? data.type ?? '?';
        voiceLog('WS message', { event: eventType, msgChannelId, ourCid, skip: msgChannelId !== ourCid && data.type !== 'voice_signal' });
        if (msgChannelId !== ourCid && data.type !== 'voice_signal') return;
        if (data.type === 'voice_signal' && data.from_user_id && data.payload) {
          voiceLog('voice_signal received', { from_user_id: data.from_user_id, payload_type: (data.payload as { type?: string })?.type });
          signalHandlerRef.current?.(String(data.from_user_id), data.payload);
          return;
        }
        if (data.event === 'joined') {
          voiceLog('applying joined', { user_id: data.user_id, channel_id: msgChannelId });
          setVoiceState((prev) => {
            if (!prev || (msgChannelId != null && prev.channelId?.toLowerCase() !== msgChannelId)) return prev;
            if (prev.members.some((m) => String(m.user_id) === String(data.user_id))) return prev;
            return {
              ...prev,
              members: [
                ...prev.members,
                {
                  user_id: String(data.user_id ?? ''),
                  email: typeof data.email === 'string' ? data.email : '',
                  name: typeof data.name === 'string' || data.name === null ? (data.name as string | null) : null,
                  joined_at: typeof data.joined_at === 'string' ? data.joined_at : new Date().toISOString(),
                  mute_mic: false,
                  video_enabled: false,
                  screen_share_enabled: false,
                },
              ],
            };
          });
          ruscordMe().then((fresh) => {
            const currentCid = (voiceStateRef.current?.channelId ?? '').toLowerCase();
            voiceLog('refetch after joined', { fresh_channel_id: fresh.channel_id, currentCid, members_count: fresh.members?.length });
            if (fresh.channel_id && String(fresh.channel_id).toLowerCase() === currentCid && Array.isArray(fresh.members)) {
              setVoiceState((p) => (p && p.channelId ? { ...p, members: fresh.members! } : p));
            }
          }).catch(() => {});
        }
        if (data.event === 'voice_state_update') {
          const uid = data.user_id != null ? String(data.user_id) : null;
          if (uid) {
            const mute_mic = Boolean(data.mute_mic);
            const video_enabled = Boolean(data.video_enabled);
            const screen_share_enabled = Boolean(data.screen_share_enabled);
            setVoiceState((prev) => {
              if (!prev || (msgChannelId != null && prev.channelId?.toLowerCase() !== msgChannelId)) return prev;
              return {
                ...prev,
                members: prev.members.map((m) =>
                  String(m.user_id) === uid
                    ? {
                        ...m,
                        mute_mic,
                        video_enabled,
                        screen_share_enabled,
                      }
                    : m
                ),
              };
            });
          }
        }
        if (data.event === 'left') {
          voiceLog('applying left', { user_id: data.user_id, channel_id: msgChannelId });
          setVoiceState((prev) => (prev ? { ...prev, members: prev.members.filter((m) => String(m.user_id) !== String(data.user_id)) } : null));
          ruscordMe().then((fresh) => {
            const currentCid = (voiceStateRef.current?.channelId ?? '').toLowerCase();
            voiceLog('refetch after left', { fresh_channel_id: fresh.channel_id, currentCid, members_count: fresh.members?.length });
            if (fresh.channel_id && Array.isArray(fresh.members)) {
              if (String(fresh.channel_id).toLowerCase() === currentCid) {
                setVoiceState((p) => (p && p.channelId ? { ...p, members: fresh.members! } : p));
              }
            } else if (!fresh.channel_id) {
              setVoiceState(null);
            }
          }).catch(() => {});
        }
        } catch (e) {
          voiceLog('WS onmessage parse error', e);
          // ignore
        }
      };
      ws.onerror = () => voiceLog('WS error');
      ws.onclose = () => voiceLog('WS closed');
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      voiceLog('WS cleanup, closing');
      if (ws) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [voiceState?.channelId, token, hubSubscriptionKey, hubSubscriptionChannelIds, hubSubscriptionServerId, logout, refreshUser, showToast]);

  useEffect(() => {
    /** Закрыть peer connections и удалённые потоки. Локальный захват экрана/микрофона не трогаем — иначе при каждом обновлении списка участников mesh рвётся и getDisplayMedia гасится → «Нет сигнала». */
    const cleanupPeersOnly = () => {
      setRemoteVideoUserIds([]);
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};
      pendingIceCandidatesRef.current = {};
      lastIceRestartAtRef.current = {};
      recoveryAttemptsRef.current = {};
      Object.values(remoteAudiosRef.current).forEach((a) => a.remove());
      remoteAudiosRef.current = {};
      Object.values(remoteVideoStreamsRef.current).forEach((s) => s.getTracks().forEach((t) => t.stop()));
      remoteVideoStreamsRef.current = {};
      signalHandlerRef.current = null;
    };
    /** Полный сброс RTC при выходе из канала / отключении передачи / готовности микрофона — в том числе остановка демонстрации экрана. */
    const cleanupVoiceRtcFully = () => {
      cleanupPeersOnly();
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    };
    if (!user?.id || !voiceState?.channelId || !voiceState.transmissionEnabled || !micStreamReady) {
      cleanupVoiceRtcFully();
      return;
    }
    const stream = micStreamRef.current;
    if (!stream) return;
    const others = voiceState.members.filter((m) => String(m.user_id) !== String(user.id));
    const sendSignal = (toUserId: string, payload: object) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pl = payload as { type?: string };
        voiceLog('voice_signal send', { to_user_id: toUserId, payload_type: pl?.type });
        wsRef.current.send(JSON.stringify({ type: 'voice_signal', to_user_id: toUserId, payload }));
      }
    };
    sendSignalRef.current = sendSignal;
    const drainIceQueue = (pc: RTCPeerConnection, fromUserId: string) => {
      drainPendingIce(pendingIceCandidatesRef.current, fromUserId, (c) => {
        pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      });
    };
    const pcConfig = buildVoiceRtcConfiguration();

    const ICE_RESTART_COOLDOWN_MS = 8000;
    const safeIceRestartOffer = (pc: RTCPeerConnection, uid: string) => {
      if (peerConnectionsRef.current[uid] !== pc) return;
      if (pc.signalingState !== 'stable' || pc.connectionState === 'closed') {
        voiceLog('skip iceRestart offer', {
          uid,
          signaling: pc.signalingState,
          connection: pc.connectionState,
        });
        return;
      }
      const now = Date.now();
      const last = lastIceRestartAtRef.current[uid] ?? 0;
      if (now - last < ICE_RESTART_COOLDOWN_MS) {
        voiceLog('skip iceRestart (cooldown)', { uid, msSinceLast: now - last });
        return;
      }
      lastIceRestartAtRef.current[uid] = now;
      const iceSt = pc.iceConnectionState;
      const connSt = pc.connectionState;
      const recovering =
        iceSt === 'failed' || connSt === 'failed' || iceSt === 'disconnected';
      if (recovering) {
        recoveryAttemptsRef.current[uid] = (recoveryAttemptsRef.current[uid] ?? 0) + 1;
        if (recoveryAttemptsRef.current[uid] >= 5) {
          setVoiceUserFacingError({
            level: 'warning',
            message:
              'Не удалось восстановить голосовое соединение после нескольких попыток. Проверьте сеть или настройте TURN (VITE_ICE_SERVERS).',
          });
        }
      }
      voiceLog('iceRestart offer', { uid, ice: pc.iceConnectionState });
      pc.createOffer({ iceRestart: true })
        .then((offer) => {
          if (peerConnectionsRef.current[uid] !== pc) return;
          return pc.setLocalDescription(offer).then(() => {
            sendSignal(uid, { type: 'offer', sdp: offer.sdp });
          });
        })
        .catch((e) => voiceLog('iceRestart offer failed', { uid, e }));
    };

    const wirePeerConnection = (pc: RTCPeerConnection, uid: string) => {
      pc.onicecandidate = (e) => {
        if (e.candidate) sendSignal(uid, { type: 'ice', candidate: e.candidate });
      };
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        voiceLog('iceConnectionState', {
          uid,
          ice: state,
          signaling: pc.signalingState,
          connection: pc.connectionState,
        });
        if (state === 'connected' || state === 'completed') {
          recoveryAttemptsRef.current[uid] = 0;
        }
        if (state === 'failed') window.setTimeout(() => safeIceRestartOffer(pc, uid), 800);
        else if (state === 'disconnected') window.setTimeout(() => safeIceRestartOffer(pc, uid), 2500);
      };
      pc.onconnectionstatechange = () => {
        voiceLog('rtcConnectionState', { uid, connection: pc.connectionState, ice: pc.iceConnectionState });
        if (pc.connectionState === 'failed') window.setTimeout(() => safeIceRestartOffer(pc, uid), 500);
      };
      pc.ontrack = (e) => {
        const track = e.track;
        voiceLog('ontrack', { uid, kind: track.kind });
        if (track.kind === 'video') {
          setRemoteVideoUserIds((prev) => (prev.includes(uid) ? prev : [...prev, uid]));
          if (!remoteVideoStreamsRef.current[uid]) remoteVideoStreamsRef.current[uid] = new MediaStream();
          remoteVideoStreamsRef.current[uid].addTrack(track);
          bumpMediaEpoch();
          track.onended = () => {
            voiceLog('video track ended', { uid });
            const s = remoteVideoStreamsRef.current[uid];
            try {
              if (s) s.removeTrack(track);
            } catch {
              /* ignore */
            }
            const remaining =
              remoteVideoStreamsRef.current[uid]?.getVideoTracks().filter((x) => x.readyState !== 'ended').length ?? 0;
            if (remaining === 0) {
              delete remoteVideoStreamsRef.current[uid];
              setRemoteVideoUserIds((prev) => prev.filter((id) => id !== uid));
            }
            bumpMediaEpoch();
          };
        } else {
          const audio = document.createElement('audio');
          audio.autoplay = true;
          audio.muted = voiceStateRef.current?.muteSounds ?? false;
          remoteAudiosRef.current[uid] = audio;
          audio.srcObject = e.streams[0];
          audio.volume = voiceStateRef.current?.userVolumes?.[uid] ?? 1;
          document.body.appendChild(audio);
          audio.play().catch(() => {});
        }
      };
    };

    others.forEach((member) => {
      const uid = member.user_id;
      if (peerConnectionsRef.current[uid]) return;
      const pc = new RTCPeerConnection(pcConfig);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const screenStream = screenStreamRef.current;
      if (screenStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) pc.addTrack(videoTrack, screenStream);
      }
      peerConnectionsRef.current[uid] = pc;
      wirePeerConnection(pc, uid);
      void applyOutboundRtpPolicies(pc);
      if (!isPolitePeer(localUidStr, uid)) {
        voiceLog('mesh initial offer (impolite)', { uid });
        pc.createOffer().then((offer) => {
          pc.setLocalDescription(offer);
          sendSignal(uid, { type: 'offer', sdp: offer.sdp });
        }).catch((e) => voiceLog('createOffer failed', { uid, e }));
      } else {
        voiceLog('mesh polite: ждём offer от собеседника', { uid });
      }
    });
    signalHandlerRef.current = (fromUserId: string, payload: unknown) => {
      const p = payload as { type?: string; sdp?: string; candidate?: RTCIceCandidateInit };
      const pc = peerConnectionsRef.current[fromUserId] || new RTCPeerConnection(pcConfig);
      if (!peerConnectionsRef.current[fromUserId]) {
        peerConnectionsRef.current[fromUserId] = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        const screenStream = screenStreamRef.current;
        if (screenStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          if (videoTrack) pc.addTrack(videoTrack, screenStream);
        }
        wirePeerConnection(pc, fromUserId);
        void applyOutboundRtpPolicies(pc);
      }
      if (p.type === 'offer' && p.sdp) {
        const polite = isPolitePeer(localUidStr, fromUserId);
        voiceLog('handle offer', { fromUserId, polite, signaling: pc.signalingState });
        void (async () => {
          try {
            if (pc.signalingState === 'have-local-offer') {
              if (!polite) {
                voiceLog('handle offer: glare, impolite игнорирует чужой offer', { fromUserId });
                return;
              }
              await pc.setLocalDescription({ type: 'rollback' });
              voiceLog('handle offer: rollback (polite)', { fromUserId });
            }
            await pc.setRemoteDescription({ type: 'offer', sdp: p.sdp });
            drainIceQueue(pc, fromUserId);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal(fromUserId, { type: 'answer', sdp: answer.sdp });
          } catch (err) {
            voiceLog('handle offer failed', err);
            setVoiceUserFacingError({
              level: 'error',
              message:
                'Не удалось установить голосовое соединение с участником. Проверьте сеть, файрвол или задайте TURN (VITE_ICE_SERVERS).',
            });
          }
        })();
      } else if (p.type === 'answer' && p.sdp) {
        voiceLog('handle answer', { fromUserId });
        if (pc.signalingState === 'have-local-offer') {
          pc.setRemoteDescription({ type: 'answer', sdp: p.sdp })
            .then(() => drainIceQueue(pc, fromUserId))
            .catch((err) => {
              voiceLog('setRemoteDescription(answer) failed', err);
              setVoiceUserFacingError({
                level: 'warning',
                message: 'Ошибка подтверждения голосового канала. Попробуйте выйти и зайти в канал снова.',
              });
            });
        }
      } else if (p.type === 'ice' && p.candidate) {
        voiceLog('handle ice', { fromUserId });
        if (pc.remoteDescription) {
          pc.addIceCandidate(new RTCIceCandidate(p.candidate)).catch(() => {});
        } else {
          enqueuePendingIce(pendingIceCandidatesRef.current, fromUserId, p.candidate);
        }
      }
    };

    // Проверка наличия звука: если через 4 с для кого-то нет трека — повторно отправить offer (переподключение между каналами)
    const retryTimer = setTimeout(() => {
      others.forEach((member) => {
        const uid = member.user_id;
        const pc = peerConnectionsRef.current[uid];
        if (!pc || remoteAudiosRef.current[uid]) return;
        if (pc.signalingState !== 'stable' && pc.signalingState !== 'closed') return;
        voiceLog('retry createOffer (no audio)', { uid });
        pc.createOffer().then((offer) => {
          pc.setLocalDescription(offer);
          sendSignal(uid, { type: 'offer', sdp: offer.sdp });
        }).catch(() => {});
      });
    }, 4000);

    // Периодическая проверка: при disconnected/failed — iceRestart, не трогаем нестабильный signaling
    const healthInterval = setInterval(() => {
      Object.entries(peerConnectionsRef.current).forEach(([uid, pc]) => {
        const ice = pc.iceConnectionState;
        if (ice !== 'failed' && ice !== 'disconnected') return;
        voiceLog('health check', { uid, ice, signaling: pc.signalingState, connection: pc.connectionState });
        safeIceRestartOffer(pc, uid);
      });
    }, 25000);

    let statsInterval: number | undefined;
    if (import.meta.env.DEV && voiceLogEnabled()) {
      statsInterval = window.setInterval(() => {
        Object.entries(peerConnectionsRef.current).forEach(([uid, pc]) => {
          pc
            .getStats()
            .then((report) => {
              for (const s of report.values()) {
                if (
                  s.type === 'outbound-rtp' &&
                  'kind' in s &&
                  (s as RTCOutboundRtpStreamStats).kind === 'video'
                ) {
                  const packetsLost =
                    'packetsLost' in s ? (s as { packetsLost?: number }).packetsLost : undefined;
                  voiceLog('video outbound stats', { uid, packetsLost });
                }
              }
            })
            .catch(() => {});
        });
      }, 30000);
    }

    return () => {
      clearTimeout(retryTimer);
      clearInterval(healthInterval);
      if (statsInterval !== undefined) clearInterval(statsInterval);
      cleanupPeersOnly();
    };
  }, [voiceState?.channelId, voiceState?.members, voiceState?.transmissionEnabled, user?.id, micStreamReady, bumpMediaEpoch]);

  // Демонстрация экрана: добавление уже полученного (по клику) трека во все peer connections
  useEffect(() => {
    if (!voiceState?.channelId || !voiceState.transmissionEnabled || !voiceState.screenShareEnabled) {
      if (screenStreamRef.current) {
        const screenStream = screenStreamRef.current;
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.entries(peerConnectionsRef.current).forEach(([uid, pc]) => {
          const senders = pc.getSenders();
          const screenSender = screenTrack ? senders.find((s) => s.track === screenTrack) : senders.find((s) => s.track?.kind === 'video');
          if (screenSender) pc.removeTrack(screenSender);
          pc.createOffer().then((offer) => {
            pc.setLocalDescription(offer);
            sendSignalRef.current(uid, { type: 'offer', sdp: offer.sdp });
          }).catch(() => {});
        });
        screenStream.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      return;
    }
    const screenStream = screenStreamRef.current;
    if (!screenStream) return;
    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack) return;
    const peerIds = Object.keys(peerConnectionsRef.current);
    voiceLog('screen share: adding track to', peerIds.length, 'peer(s)', peerIds);
    Object.entries(peerConnectionsRef.current).forEach(([uid, pc]) => {
      pc.addTrack(videoTrack, screenStream);
      void applyOutboundRtpPolicies(pc);
      pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
        sendSignalRef.current(uid, { type: 'offer', sdp: offer.sdp });
      }).catch(() => {});
    });
  }, [voiceState?.channelId, voiceState?.screenShareEnabled, voiceState?.transmissionEnabled]);

  useEffect(() => {
    if (!voiceState?.channelId || !voiceState.transmissionEnabled || !micStreamReady) return;
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      void applyOutboundRtpPolicies(pc);
    });
  }, [mediaEpoch, voiceState?.channelId, voiceState?.transmissionEnabled, micStreamReady]);

  useEffect(() => {
    if (!voiceState?.userVolumes) return;
    Object.entries(remoteAudiosRef.current).forEach(([uid, audio]) => {
      audio.volume = voiceState.userVolumes[uid] ?? 1;
    });
  }, [voiceState?.userVolumes]);

  // Заглушить звук: отключить воспроизведение всех микрофонов участников
  useEffect(() => {
    const muted = voiceState?.muteSounds ?? false;
    Object.values(remoteAudiosRef.current).forEach((audio) => {
      audio.muted = muted;
    });
  }, [voiceState?.muteSounds]);

  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeFrameRef = useRef<number>(0);
  useEffect(() => {
    if (!voiceState?.channelId || !voiceState.transmissionEnabled) {
      setMicStreamReady(false);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      analyserRef.current = null;
      if (volumeFrameRef.current) cancelAnimationFrame(volumeFrameRef.current);
      setVoiceState((p) => (p ? { ...p, volume: 0 } : null));
      return;
    }
    let cancelled = false;
    const wantVideo = !!(voiceState.videoEnabled && voiceState.transmissionEnabled);
    const md = navigator.mediaDevices;
    if (!md?.getUserMedia) {
      setMicStreamReady(false);
      setVoiceState((p) => (p ? { ...p, volume: 0 } : null));
      return;
    }
    md
      .getUserMedia({ audio: true, video: wantVideo ? { facingMode: 'user' } : false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.getAudioTracks().forEach((t) => {
          t.enabled = !(voiceStateRef.current?.muteMic ?? false);
        });
        micStreamRef.current = stream;
        setMicStreamReady(true);
        bumpMediaEpoch();
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        let lastVol = 0;
        let lastUpdate = 0;
        function tick() {
          if (cancelled || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length / 255;
          const now = Date.now();
          if (now - lastUpdate > 80 || Math.abs(avg - lastVol) > 0.05) {
            lastUpdate = now;
            lastVol = avg;
            setVoiceState((p) => (p ? { ...p, volume: avg } : null));
          }
          volumeFrameRef.current = requestAnimationFrame(tick);
        }
        tick();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      setMicStreamReady(false);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      if (volumeFrameRef.current) cancelAnimationFrame(volumeFrameRef.current);
    };
  }, [voiceState?.channelId, voiceState?.transmissionEnabled, voiceState?.videoEnabled, bumpMediaEpoch]);

  useEffect(() => {
    const s = micStreamRef.current;
    if (!s) return;
    const muted = voiceState?.muteMic ?? false;
    s.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }, [voiceState?.muteMic]);

  useEffect(() => {
    Promise.all([getModules(), getDashboardStats(), getPermissions().catch(() => [])])
      .then(([mods, s, groups]) => {
        setModules(mods);
        setStats(s);
        setPermissionGroups(Array.isArray(groups) ? groups : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <RuscordVoiceProvider
      value={{
        voicePanel,
        setVoicePanel,
        streams: streamsContext,
        voiceRtcStatus,
        voiceUserFacingError,
        dismissVoiceUserFacingError,
        hubSubscriptionChannelIds,
        hubSubscriptionServerId,
        setHubSubscriptionServerId,
        setHubSubscriptionChannelIds,
        registerVoiceHubHandler,
        ruscordLocalLeaveRef,
      }}
    >
    <AppShell
      sidebar={
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          adminSections={adminSectionsVisible}
          adminOpen={adminOpen}
          onToggleAdmin={() => setAdminOpen((v) => !v)}
          servicesOpen={servicesOpen}
          onToggleServices={() => setServicesOpen((v) => !v)}
          totalUnread={totalUnread}
          user={user}
          permissionGroups={permissionGroups}
          roleMenuOpen={roleMenuOpen}
          onToggleRoleMenu={() => setRoleMenuOpen((v) => !v)}
          onLogout={handleLogout}
          voiceBar={
            <VoiceBar
              sidebarCollapsed={sidebarCollapsed}
              screenShareHint={screenShareUserHint}
              onDismissScreenShareHint={() => setScreenShareUserHint(null)}
            />
          }
        />
      }
      bottomNav={isMobile ? <BottomNav items={bottomNavItems} unreadByPath={chatUnreadByPath} /> : undefined}
    >
      <Routes>
        <Route index element={<DashboardHome loading={loading} stats={stats} modules={modules} user={user} />} />
        <Route path="roles" element={<Roles />} />
        <Route path="users" element={<Users />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="chats" element={<Chats />} />
        <Route path="chats/:chatId" element={<ChatRoom />} />
        <Route path="friends" element={<Friends />} />
        <Route path="ruscord" element={<Ruscord />} />
        <Route path="settings" element={<Settings />} />
        <Route path=":moduleId" element={<ModulePlaceholder />} />
      </Routes>
    </AppShell>
    </RuscordVoiceProvider>
  );
}

function DashboardHome({
  loading,
  stats,
  modules,
  user,
}: {
  loading: boolean;
  stats: DashboardStats | null;
  modules: ModuleInfo[];
  user: User | null;
}) {
  if (loading) return <DotWaveLoader label="Загрузка…" />;

  const extraModules: { id: string; name: string; description: string; path: string; permission: string }[] = [];
  if (canSeeSection('users.read', user?.permissions)) {
    extraModules.push({
      id: 'users',
      name: 'Пользователи',
      description: 'Управление учётными записями',
      path: '/dashboard/users',
      permission: 'users.read',
    });
  }
  if (canSeeSection('roles.read', user?.permissions)) {
    extraModules.push({
      id: 'roles',
      name: 'Роли',
      description: 'Роли и права доступа',
      path: '/dashboard/roles',
      permission: 'roles.read',
    });
  }
  if (canSeeSection('sessions.read', user?.permissions)) {
    extraModules.push({
      id: 'sessions',
      name: 'Сессии',
      description: 'Активные сессии и presence',
      path: '/dashboard/sessions',
      permission: 'sessions.read',
    });
  }

  const apiModuleIds = new Set(modules.map((m) => m.id));
  const adminModules = extraModules.filter((m) => !apiModuleIds.has(m.id));

  return (
    <>
      <h1 className={styles.pageTitle}>Панель управления</h1>
      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.users_count}</span>
            <span className={styles.statLabel}>Пользователей</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.modules_count}</span>
            <span className={styles.statLabel}>Модулей</span>
          </div>
        </div>
      )}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Модули</h2>
        <div className={styles.moduleGrid}>
          {modules.map((m) => (
            <SpotlightCard
              key={m.id}
              to={`/dashboard/${m.id}`}
              title={m.name}
              description={m.description}
              icon="◆"
              className={styles.moduleCardSpotlight}
            />
          ))}
          {adminModules.map((m) => (
            <SpotlightCard
              key={m.id}
              to={m.path}
              title={m.name}
              description={m.description}
              icon="◆"
              className={styles.moduleCardSpotlight}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function ModulePlaceholder() {
  return (
    <div className={styles.placeholder}>
      <p>Модуль в разработке. Здесь будет интерфейс выбранного раздела.</p>
    </div>
  );
}
