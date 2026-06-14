import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api';

const token = () => localStorage.getItem('token');

type Props = {
  chatId: string;
  className?: string;
  fallbackLetter?: string;
  size?: number;
};

export default function ChatAvatar({ chatId, className, fallbackLetter, size = 40 }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatId) {
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
    let cancelled = false;
    fetch(`${API_BASE}/chats/${chatId}/avatar`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('no avatar');
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setSrc(url);
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
  }, [chatId]);

  const letter = (fallbackLetter ?? '?')[0].toUpperCase();
  if (failed || !src) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface2)',
          color: 'var(--text-muted)',
          fontSize: size * 0.4,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {letter}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  );
}
