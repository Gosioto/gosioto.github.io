import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../api';
import { AVATAR_UPDATED_EVENT, type AvatarUpdatedDetail } from '../avatarEvents';
import styles from './AvatarLightbox.module.css';

const token = () => localStorage.getItem('token');

type Props = {
  userId: string;
  fallbackLetter?: string;
  onClose: () => void;
};

export default function AvatarLightbox({ userId, fallbackLetter, onClose }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const [cacheKey, setCacheKey] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    function onAvatarUpdated(e: Event) {
      const d = (e as CustomEvent<AvatarUpdatedDetail>).detail;
      if (d?.userId === userId) setCacheKey((k) => k + 1);
    }
    window.addEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated as EventListener);
    return () => window.removeEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated as EventListener);
  }, [userId]);

  useEffect(() => {
    setFailed(false);
    const t = token();
    if (!t || !userId) {
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

  const letter = (fallbackLetter || '?').toUpperCase().slice(0, 1);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.frame} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Закрыть
        </button>
        {src && !failed ? (
          <img src={src} alt="" className={styles.image} />
        ) : (
          <div className={styles.placeholder} aria-hidden>
            {letter}
          </div>
        )}
      </div>
    </div>
  );
}
