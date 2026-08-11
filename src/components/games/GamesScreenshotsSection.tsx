'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { screenshotsData, Screenshot } from '@/data/screenshotsData';

const MOSAIC_LIMIT = 12;

export default function GamesScreenshotsSection() {
  const shots = useMemo(
    () => [...screenshotsData].sort((a, b) => b.timestamp - a.timestamp).slice(0, MOSAIC_LIMIT),
    []
  );

  const [active, setActive] = useState<Screenshot | null>(null);
  const [index, setIndex] = useState(0);

  const openAt = (shot: Screenshot) => {
    const i = shots.findIndex((s) => s.id === shot.id);
    setIndex(i);
    setActive(shot);
  };

  const close = useCallback(() => setActive(null), []);

  const navigate = useCallback(
    (dir: number) => {
      setIndex((prev) => {
        const next = prev + dir;
        if (next < 0 || next >= shots.length) return prev;
        setActive(shots[next]);
        return next;
      });
    },
    [shots]
  );

  useEffect(() => {
    if (!active) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close, navigate]);

  return (
    <section className="gp-section" id="screenshots">
      <div className="gp-section-head">
        <h2 className="gp-section-title">Скриншоты</h2>
        <p className="gp-section-sub">
          Кадры из Steam — Witcher, Tradesman, EVE, Warframe, GTFO и другие.
        </p>
      </div>

      <div className="gp-shots-mosaic">
        {shots.map((shot, i) => (
          <button
            key={shot.id}
            type="button"
            className="gp-shot"
            style={{ animationDelay: `${0.04 * i}s` }}
            onClick={() => openAt(shot)}
            aria-label={`${shot.game}: открыть скриншот`}
          >
            <img src={shot.thumbnail || shot.path} alt={shot.game} loading="lazy" />
            <span className="gp-shot-caption">{shot.game}</span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="gp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр скриншота"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="gp-lightbox-inner">
            <button type="button" className="gp-lightbox-close" onClick={close} aria-label="Закрыть">
              ✕
            </button>
            {index > 0 && (
              <button
                type="button"
                className="gp-lightbox-nav prev"
                onClick={() => navigate(-1)}
                aria-label="Предыдущий"
              >
                ‹
              </button>
            )}
            {index < shots.length - 1 && (
              <button
                type="button"
                className="gp-lightbox-nav next"
                onClick={() => navigate(1)}
                aria-label="Следующий"
              >
                ›
              </button>
            )}
            <img src={active.path} alt={active.game} />
            <div className="gp-lightbox-meta">
              <span>{active.game}</span>
              <span>
                {index + 1} / {shots.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
