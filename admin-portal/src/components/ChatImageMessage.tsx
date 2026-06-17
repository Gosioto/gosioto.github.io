import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../api';
import styles from './ChatImageMessage.module.css';

const token = () => localStorage.getItem('token');

type ImagePayload = {
  width?: number;
  height?: number;
  size?: number;
};

type Props = {
  chatId: string;
  messageId: string;
  payload?: ImagePayload | null;
};

export default function ChatImageMessage({ chatId, messageId, payload }: Props) {
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);
  const [fullSrc, setFullSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const fullBlobUrlRef = useRef<string | null>(null);

  const imageUrl = `${API_BASE}/chats/${chatId}/messages/${messageId}/image`;

  const loadImage = useCallback(async () => {
    const t = token();
    if (!t) throw new Error('Not authenticated');
    const res = await fetch(imageUrl, { headers: { Authorization: `Bearer ${t}` } });
    if (!res.ok) throw new Error('Failed to load image');
    return res.blob();
  }, [imageUrl]);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    loadImage()
      .then((blob) => {
        if (cancelled) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setThumbSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [loadImage]);

  useEffect(() => {
    if (!lightboxOpen) {
      if (fullBlobUrlRef.current) {
        URL.revokeObjectURL(fullBlobUrlRef.current);
        fullBlobUrlRef.current = null;
      }
      setFullSrc(null);
      return;
    }
    if (thumbSrc) {
      setFullSrc(thumbSrc);
      return;
    }
    let cancelled = false;
    loadImage()
      .then((blob) => {
        if (cancelled) return;
        if (fullBlobUrlRef.current) URL.revokeObjectURL(fullBlobUrlRef.current);
        const url = URL.createObjectURL(blob);
        fullBlobUrlRef.current = url;
        setFullSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lightboxOpen, loadImage, thumbSrc]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  if (failed) {
    return <div className={styles.failed}>Не удалось загрузить изображение</div>;
  }

  const aspectRatio =
    payload?.width && payload?.height && payload.width > 0
      ? `${payload.width} / ${payload.height}`
      : undefined;

  return (
    <>
      <button
        type="button"
        className={styles.thumbBtn}
        onClick={() => setLightboxOpen(true)}
        disabled={!thumbSrc}
        style={aspectRatio ? { aspectRatio } : undefined}
        aria-label="Открыть изображение"
      >
        {thumbSrc ? (
          <img src={thumbSrc} alt="" className={styles.thumbImg} loading="lazy" />
        ) : (
          <span className={styles.loading}>Загрузка…</span>
        )}
      </button>
      {lightboxOpen ? (
        <div
          className={styles.lightboxBackdrop}
          role="presentation"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className={styles.lightboxInner}
            role="dialog"
            aria-label="Изображение"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            {fullSrc ? (
              <img src={fullSrc} alt="" className={styles.lightboxImg} />
            ) : (
              <p className={styles.loading}>Загрузка…</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
