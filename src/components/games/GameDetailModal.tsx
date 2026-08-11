'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Game, steamCapsule } from '@/types/game';
import { profileMeta } from '@/data/gamesData';
import { filterScreenshots, Screenshot } from '@/data/screenshotsData';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
}

export default function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  const shots = useMemo(
    () =>
      game
        ? filterScreenshots(game.gameId, undefined, game.appId).sort(
            (a, b) => b.timestamp - a.timestamp
          )
        : [],
    [game]
  );
  const [lightbox, setLightbox] = useState<Screenshot | null>(null);
  const [index, setIndex] = useState(0);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const navigate = useCallback(
    (dir: number) => {
      setIndex((prev) => {
        const next = prev + dir;
        if (next < 0 || next >= shots.length) return prev;
        setLightbox(shots[next]);
        return next;
      });
    },
    [shots]
  );

  useEffect(() => {
    if (!game) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) closeLightbox();
        else onClose();
      }
      if (lightbox) {
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [game, lightbox, onClose, closeLightbox, navigate]);

  if (!game) return null;

  const steamShots = `${profileMeta.screenshotsUrl}?appid=${game.appId}`;
  const iconSrc = steamCapsule(game.appId);

  return (
    <div
      className="gp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gp-game-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gp-modal">
        <button type="button" className="gp-modal-close" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>

        <div className="gp-modal-head">
          <img className="gp-modal-icon" src={iconSrc} alt="" width={231} height={87} />
          <div>
            <h2 id="gp-game-modal-title" className="gp-modal-title">
              {game.name}
            </h2>
            <p className="gp-modal-meta">
              {game.hours.toLocaleString('ru-RU')} ч
              {game.achievements ? ` · ${game.achievements}` : ''}
              {game.lastLaunch ? ` · ${game.lastLaunch}` : ''}
            </p>
            {game.description && <p className="gp-modal-desc">{game.description}</p>}
            <a
              className="gp-btn gp-btn-ghost gp-modal-steam-link"
              href={steamShots}
              target="_blank"
              rel="noopener noreferrer"
            >
              Скриншоты в Steam
            </a>
          </div>
        </div>

        <div className="gp-modal-gallery">
          <h3 className="gp-modal-gallery-title">
            Галерея {shots.length > 0 ? `(${shots.length})` : ''}
          </h3>
          {shots.length === 0 ? (
            <p className="gp-modal-empty">
              Локальных скриншотов пока нет. Запустите{' '}
              <code>npm run steam:screenshots</code> или откройте альбом в Steam.
            </p>
          ) : (
            <div className="gp-modal-shots">
              {shots.map((shot, i) => (
                <button
                  key={shot.id}
                  type="button"
                  className="gp-modal-shot"
                  onClick={() => {
                    setIndex(i);
                    setLightbox(shot);
                  }}
                >
                  <img src={shot.thumbnail || shot.path} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="gp-lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="gp-lightbox-inner">
            <button
              type="button"
              className="gp-lightbox-close"
              onClick={closeLightbox}
              aria-label="Закрыть"
            >
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
            <img src={lightbox.path} alt={game.name} />
            <div className="gp-lightbox-meta">
              <span>{game.name}</span>
              <span>
                {index + 1} / {shots.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
