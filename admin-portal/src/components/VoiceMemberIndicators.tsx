import type { RuscordVoiceMember } from '../api';
import styles from './VoiceMemberIndicators.module.css';

type Props = {
  member: Pick<RuscordVoiceMember, 'mute_mic' | 'video_enabled' | 'screen_share_enabled'>;
  /** Компактные иконки для наложения на аватар */
  compact?: boolean;
};

/** Иконки состояния голоса (микрофон / камера / демонстрация), в духе Discord. */
export default function VoiceMemberIndicators({ member, compact }: Props) {
  const muted = Boolean(member.mute_mic);
  const cam = Boolean(member.video_enabled);
  const screen = Boolean(member.screen_share_enabled);
  const wrapClass = compact ? styles.wrapCompact : styles.wrap;

  return (
    <span className={wrapClass} aria-hidden>
      {muted ? (
        <span className={styles.iconMuted} title="Микрофон выключен">
          <MicMutedSvg />
        </span>
      ) : null}
      {cam ? (
        <span className={styles.iconOn} title="Камера включена">
          <CameraSvg />
        </span>
      ) : null}
      {screen ? (
        <span className={styles.iconOn} title="Демонстрация экрана">
          <ScreenSvg />
        </span>
      ) : null}
    </span>
  );
}

function MicMutedSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    </svg>
  );
}

function CameraSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ScreenSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}
