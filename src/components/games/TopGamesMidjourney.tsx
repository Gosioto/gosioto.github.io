// src/components/games/TopGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { topGames } from '@/data/gamesData';

export default function TopGamesMidjourney() {
  const [openGame, setOpenGame] = useState<string | null>(null);

  const toggleGame = (gameName: string) => {
    setOpenGame(openGame === gameName ? null : gameName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, gameName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleGame(gameName);
    }
  };

  const getAspectClass = (ev: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = ev.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    return ratio < 1 ? 'aspect-3-4' : 'aspect-16-9';
  };

  const handleImageLoad = (ev: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const cls = getAspectClass(ev);
    ev.currentTarget.classList.add(cls);
  };

  return (
    <>
      {topGames.map((game) => (
        <div
          key={game.name}
          className="games-card games-animate-scale top5-card"
          role="button"
          tabIndex={0}
          aria-expanded={openGame === game.name}
          aria-controls={`top-game-details-${game.name}`}
          onKeyDown={(e) => handleKeyDown(e, game.name)}
          title={`${game.name} — показать детали`}
          style={{ backgroundImage: `url(${game.image})` }}
        >
          <div className="top5-rank-badge" aria-hidden="true">№{game.rank}</div>
          <div className="top5-corner-shine" aria-hidden="true"></div>
          <div className="games-card-content">
            <div className="flex items-center justify-between w-full">
              <h3 className="games-card-title">{game.name}</h3>
              <div className="games-top-card-rank">Топ-{game.rank}</div>
            </div>
            <div className="games-card-hours">{game.hours}+ ч</div>

            {openGame === game.name && (
              <div id={`top-game-details-${game.name}`} className="games-details mt-3 pt-3 border-t border-gray-700">
                <div className="space-y-2 mb-3 text-sm text-gray-300">
                  <p>
                    <strong>Последний запуск:</strong> {game.lastLaunch}
                  </p>
                  <p>
                    <strong>Достижения:</strong> {game.achievements}
                  </p>
                </div>
                <div className="games-card-actions">
                  <button
                    className="btn btn-primary"
                    data-action="screenshots"
                    data-game={game.name}
                    aria-label={`Скриншоты: ${game.name}`}
                  >
                    <i className="fas fa-images mr-2" aria-hidden="true"></i>
                    Скриншоты
                  </button>
                  <button
                    className="btn btn-outline"
                    data-action="achievements"
                    data-game={game.name}
                    aria-label={`Достижения: ${game.name}`}
                  >
                    <i className="fas fa-trophy mr-2" aria-hidden="true"></i>
                    Достижения
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => toggleGame(game.name)}
              className="btn btn-toggle top5-toggle mt-3"
              aria-expanded={openGame === game.name}
              aria-controls={`top-game-details-${game.name}`}
            >
              <span className="mr-2">{openGame === game.name ? 'Скрыть детали' : 'Показать детали'}</span>
              <i className="chevron fas fa-chevron-down" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
