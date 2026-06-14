import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api';
import { AVATAR_UPDATED_EVENT, type AvatarUpdatedDetail } from '../avatarEvents';

const token = () => localStorage.getItem('token');

type Props = {
  userId: string;
  className?: string;
  /** Буква для плейсхолдера при отсутствии аватара */
  fallbackLetter?: string;
  size?: number;
};

export default function Avatar({ userId, className, fallbackLetter, size = 40 }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const [cacheKey, setCacheKey] = useState(0);

  useEffect(() => {
    function onAvatarUpdated(e: Event) {
      const d = (e as CustomEvent<AvatarUpdatedDetail>).detail;
      if (d?.userId === userId) setCacheKey((k) => k + 1);
    }
    window.addEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated as EventListener);
    return () => window.removeEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated as EventListener);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setSrc(null);
      setFailed(true);
      return;
    }
    setFailed(false);
    const t = token();
    if (!t) {
      setFailed(true);
      return;
    }
    const qs = cacheKey > 0 ? `?v=${cacheKey}` : '';
    fetch(`${API_BASE}/avatars/${userId}${qs}`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => {
        if (!r.ok) {
          setFailed(true);
          return null;
        }
        return r.blob();
      })
      .then((blob) => {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        if (blob) {
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setSrc(url);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setSrc(null);
    };
  }, [userId, cacheKey]);

  const style = size ? { width: size, height: size, fontSize: size * 0.45 } : undefined;
  const letter = (fallbackLetter || '?').toUpperCase().slice(0, 1);

  if (src && !failed) {
    return <img src={src} alt="" className={className} style={style} />;
  }
  return (
    <div
      className={className}
      style={{
        ...style,
        borderRadius: '50%',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontWeight: 600,
      }}
      aria-hidden
    >
      {letter}
    </div>
  );
}
