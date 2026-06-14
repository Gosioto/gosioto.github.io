import { useEffect, useRef, useState } from 'react';

import { ruscordIconUrl } from '../api';

const token = () => localStorage.getItem('token');

type Props = {
  serverId: string;
  hasIcon?: boolean;
  fallbackLetter?: string;
  className?: string;
  cacheKey?: number;
};

export default function RuscordServerIcon({
  serverId,
  hasIcon = false,
  fallbackLetter,
  className,
  cacheKey = 0,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(!hasIcon);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!serverId || !hasIcon) {
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
    fetch(ruscordIconUrl(serverId, cacheKey), { headers: { Authorization: `Bearer ${t}` } })
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
  }, [serverId, hasIcon, cacheKey]);

  const letter = (fallbackLetter || '?').toUpperCase().slice(0, 1);

  if (src && !failed) {
    return <img src={src} alt="" className={className} />;
  }
  return <span className={className} aria-hidden>{letter}</span>;
}
