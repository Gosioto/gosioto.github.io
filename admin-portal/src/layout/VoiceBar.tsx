import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import Avatar from '../components/Avatar';
import VoiceMemberIndicators from '../components/VoiceMemberIndicators';
import { useRuscordVoice, type VoiceRtcStatus } from '../RuscordVoiceContext';
import { IconHeadset } from '../ui/Icon/Icon';
import styles from './VoiceBar.module.css';

type VoiceAccordionId = 'channel' | 'members' | 'devices';

function VoicePanelSectionBlock({
  sectionId,
  title,
  expanded,
  onToggle,
  children,
  headerExtra,
}: {
  sectionId: VoiceAccordionId;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  headerExtra?: ReactNode;
}) {
  const sid = sectionId;
  return (
    <div className={styles.voicePanelSection} data-section={sectionId}>
      <button
        type="button"
        className={styles.voicePanelSectionHeader}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`voice-ac-${sid}`}
        id={`voice-ac-${sid}-btn`}
      >
        <span className={styles.voicePanelSectionChevron} aria-hidden>
          {expanded ? '▼' : '▸'}
        </span>
        <span>{title}</span>
        {headerExtra}
      </button>
      {expanded ? (
        <div
          id={`voice-ac-${sid}`}
          className={styles.voicePanelSectionBody}
          role="region"
          aria-labelledby={`voice-ac-${sid}-btn`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function voiceStatusDotClass(phase: VoiceRtcStatus['phase'] | undefined): string {
  switch (phase) {
    case 'rtc_ok':
      return styles.voiceStatusConnected;
    case 'weak':
    case 'negotiating':
    case 'connecting':
      return styles.voiceStatusConnecting;
    case 'no_route':
      return styles.voiceStatusFailed;
    default:
      return styles.voiceStatusIdle;
  }
}

function VoiceStatusDot({ phase }: { phase: VoiceRtcStatus['phase'] | undefined }) {
  const cls = voiceStatusDotClass(phase);
  const spinning = phase === 'connecting' || phase === 'negotiating';
  return <span className={`${styles.voiceStatusDot} ${cls} ${spinning ? styles.voiceStatusSpinning : ''}`} title={phase ?? 'idle'} />;
}

function voicePanelRtcRowClass(phase: VoiceRtcStatus['phase']): string {
  switch (phase) {
    case 'rtc_ok':
      return styles.voiceRtcOk;
    case 'weak':
    case 'negotiating':
    case 'connecting':
      return styles.voiceRtcWarn;
    case 'no_route':
      return styles.voiceRtcBad;
    case 'idle':
    case 'solo':
    default:
      return styles.voiceRtcNeutral;
  }
}

type Props = {
  sidebarCollapsed?: boolean;
  screenShareHint: string | null;
  onDismissScreenShareHint: () => void;
};

export default function VoiceBar({ sidebarCollapsed, screenShareHint, onDismissScreenShareHint }: Props) {
  const ctx = useRuscordVoice();
  const panel = ctx?.voicePanel;
  const voiceRtcStatus = ctx?.voiceRtcStatus ?? null;
  const voiceUserFacingError = ctx?.voiceUserFacingError ?? null;
  const dismissVoiceUserFacingError = ctx?.dismissVoiceUserFacingError;
  const streams = ctx?.streams ?? null;
  const { user: me } = useAuth();
  const [shareActiveNoticeDismissed, setShareActiveNoticeDismissed] = useState(false);
  const [sectionOpen, setSectionOpen] = useState({
    channel: false,
    members: false,
    devices: true,
  });
  const [compactExpanded, setCompactExpanded] = useState(false);

  useEffect(() => {
    if (panel) {
      setSectionOpen({ channel: false, members: false, devices: true });
    }
  }, [panel?.channelId]);

  useEffect(() => {
    if (!panel?.screenShareEnabled) setShareActiveNoticeDismissed(false);
  }, [panel?.screenShareEnabled]);

  if (!panel) return null;

  const hasRemoteVideo = !!streams?.remoteVideoUserIds.some((uid) => String(uid) !== String(me?.id));
  const vol = Math.min(1, Math.max(0, panel.volume));
  const bars = [0.33, 0.66, 1].map((t) => vol >= t);
  const otherMembers = panel.members.filter((m) => m.user_id !== me?.id);
  const rtcPhase = voiceRtcStatus?.phase;

  if (sidebarCollapsed && !compactExpanded) {
    return (
      <div className={`${styles.voicePanel} ${styles.voicePanelSidebarCollapsed}`}>
        <button
          type="button"
          className={styles.voiceCompactBtn}
          onClick={() => setCompactExpanded(true)}
          title={panel.channelName}
          aria-label="Голосовой канал"
        >
          <IconHeadset size={20} />
          <VoiceStatusDot phase={rtcPhase} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${styles.voicePanel} ${sidebarCollapsed ? `${styles.voicePanelSidebarCollapsed} ${styles.voicePanelCompactPopover}` : ''}`}
    >
      {sidebarCollapsed ? (
        <button type="button" className={styles.voiceCompactClose} onClick={() => setCompactExpanded(false)} aria-label="Свернуть">
          ×
        </button>
      ) : null}
      {screenShareHint ? (
        <div className={styles.voicePanelHint} role="alert">
          <span>{screenShareHint}</span>
          <button
            type="button"
            className={styles.voicePanelHintClose}
            onClick={onDismissScreenShareHint}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      ) : null}
      {panel.screenShareEnabled && !shareActiveNoticeDismissed ? (
        <div className={styles.voicePanelShareNotice} role="status">
          <span>
            Экран транслируется в канал. Остановить — кнопкой «демонстрация» ниже или через системное меню браузера
            (индикатор записи экрана).
          </span>
          <button
            type="button"
            className={styles.voicePanelShareNoticeClose}
            onClick={() => setShareActiveNoticeDismissed(true)}
            aria-label="Скрыть напоминание"
          >
            ×
          </button>
        </div>
      ) : null}
      {voiceUserFacingError ? (
        <div
          className={
            voiceUserFacingError.level === 'error' ? styles.voicePanelUserError : styles.voicePanelUserWarn
          }
          role="alert"
        >
          <span>{voiceUserFacingError.message}</span>
          <button
            type="button"
            className={styles.voicePanelHintClose}
            onClick={() => dismissVoiceUserFacingError?.()}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      ) : null}
      <VoicePanelSectionBlock
        sectionId="channel"
        title="Канал"
        expanded={sectionOpen.channel}
        onToggle={() => setSectionOpen((p) => ({ ...p, channel: !p.channel }))}
        headerExtra={!sectionOpen.channel ? <VoiceStatusDot phase={rtcPhase} /> : null}
      >
        {sectionOpen.channel ? (
        <>
        {voiceRtcStatus ? (
          <div
            className={`${styles.voicePanelRtcLine} ${voicePanelRtcRowClass(voiceRtcStatus.phase)}`}
            title={voiceRtcStatus.detail}
          >
            {voiceRtcStatus.label}
          </div>
        ) : null}
        {hasRemoteVideo ? (
          <Link to="/dashboard/ruscord#active-channel" className={styles.voicePanelWatchStream}>
            Смотреть трансляцию
          </Link>
        ) : null}
        <div className={styles.voicePanelChannelRow}>
          <div className={styles.voicePanelChannel} title={panel.channelName}>
            {panel.channelName}
          </div>
          {panel.screenShareEnabled && (
            <span className={styles.voicePanelLiveBadge} title="У вас включена демонстрация экрана">
              Экран
            </span>
          )}
        </div>
        <div className={styles.voicePanelAvatars}>
          {panel.members.slice(0, 6).map((m) => (
            <div key={m.user_id} className={styles.voicePanelAvatarWrap} title={m.name || m.email}>
              <Avatar userId={m.user_id} fallbackLetter={m.name?.[0] ?? m.email[0]} size={28} />
              <span className={styles.voicePanelAvatarIndicators}>
                <VoiceMemberIndicators member={m} compact />
              </span>
            </div>
          ))}
          {panel.members.length > 6 && (
            <span className={styles.muted} style={{ fontSize: '0.75rem' }}>
              +{panel.members.length - 6}
            </span>
          )}
        </div>
        </>
        ) : null}
      </VoicePanelSectionBlock>

      <VoicePanelSectionBlock
        sectionId="members"
        title="Участники"
        expanded={sectionOpen.members}
        onToggle={() => setSectionOpen((p) => ({ ...p, members: !p.members }))}
      >
        {otherMembers.length > 0 ? (
          <div className={styles.voicePanelMembers}>
            {otherMembers.map((m) => (
              <div key={m.user_id} className={styles.voicePanelMemberRow}>
                <Avatar userId={m.user_id} fallbackLetter={m.name?.[0] ?? m.email[0]} size={20} />
                <VoiceMemberIndicators member={m} />
                <span className={styles.voicePanelMemberName} title={m.name || m.email}>
                  {m.name || m.email}
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={panel.userVolumes[m.user_id] ?? 1}
                  onChange={(e) => panel.setUserVolume(m.user_id, Number(e.target.value))}
                  title={`Громкость ${m.name || m.email}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.voicePanelMembersEmpty}>Других участников нет</p>
        )}
      </VoicePanelSectionBlock>

      <VoicePanelSectionBlock
        sectionId="devices"
        title="Устройства и трансляция"
        expanded={sectionOpen.devices}
        onToggle={() => setSectionOpen((p) => ({ ...p, devices: !p.devices }))}
      >
        <div className={styles.voicePanelControls}>
          <button
            type="button"
            className={`${styles.voicePanelBtn} ${panel.muteMic ? styles.voicePanelBtnMuted : styles.voicePanelBtnActive}`}
            onClick={() => panel.setMuteMic(!panel.muteMic)}
            title={panel.muteMic ? 'Включить микрофон' : 'Заглушить микрофон'}
            aria-label={panel.muteMic ? 'Включить микрофон' : 'Заглушить микрофон'}
          >
            <MicIcon muted={panel.muteMic} />
          </button>
          <button
            type="button"
            className={`${styles.voicePanelBtn} ${panel.muteSounds ? styles.voicePanelBtnMuted : ''}`}
            onClick={() => panel.setMuteSounds(!panel.muteSounds)}
            title={panel.muteSounds ? 'Включить звуки' : 'Заглушить звуки'}
            aria-label={panel.muteSounds ? 'Включить звуки' : 'Заглушить звуки'}
          >
            <SpeakerIcon muted={panel.muteSounds} />
          </button>
          <button
            type="button"
            className={`${styles.voicePanelBtn} ${panel.videoEnabled ? styles.voicePanelBtnActive : ''}`}
            onClick={() => panel.setVideoEnabled(!panel.videoEnabled)}
            title={panel.videoEnabled ? 'Выключить камеру' : 'Включить камеру'}
            aria-label={panel.videoEnabled ? 'Выключить камеру' : 'Включить камеру'}
          >
            <CameraIcon on={panel.videoEnabled} />
          </button>
          <button
            type="button"
            className={`${styles.voicePanelBtn} ${panel.screenShareEnabled ? styles.voicePanelBtnActive : ''}`}
            onClick={() => panel.setScreenShareEnabled(!panel.screenShareEnabled)}
            title={panel.screenShareEnabled ? 'Остановить демонстрацию' : 'Демонстрация экрана'}
            aria-label={panel.screenShareEnabled ? 'Остановить демонстрацию' : 'Демонстрация экрана'}
          >
            <ScreenShareIcon on={panel.screenShareEnabled} />
          </button>
          <div className={styles.voicePanelLevel}>
            {bars.map((active, i) => (
              <span key={i} className={`${styles.voicePanelLevelBar} ${active ? styles.voicePanelLevelBarActive : ''}`} />
            ))}
          </div>
        </div>
      </VoicePanelSectionBlock>

      <div className={styles.voicePanelLeaveBar}>
        <button
          type="button"
          className={styles.voicePanelLeave}
          onClick={panel.leaveChannel}
          title="Выйти из канала"
          aria-label="Выйти из канала"
        >
          <LeaveChannelIcon />
          <span className={styles.voicePanelLeaveLabel}>Выйти из канала</span>
        </button>
      </div>
    </div>
  );
}

function MicIcon({ muted }: { muted: boolean }) {
  if (muted)
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted)
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function CameraIcon({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
      {on && <circle cx="12" cy="13" r="2" fill="currentColor" />}
    </svg>
  );
}

function ScreenShareIcon({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      {on && <path d="M6 8h2l2 2 2-2h2" strokeWidth="1.5" />}
    </svg>
  );
}

function LeaveChannelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
