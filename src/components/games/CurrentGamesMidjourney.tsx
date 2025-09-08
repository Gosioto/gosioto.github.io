// src/components/games/CurrentGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { currentGames } from '@/data/gamesData';

export default function CurrentGamesMidjourney() {
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
      {currentGames.map((game) => (
        <div 
          key={game.name} 
          className={`games-current-item games-animate-scale ${openGame === game.name ? 'border-blue-500' : ''}`}
          role="button"
          tabIndex={0}
          aria-expanded={openGame === game.name}
          aria-controls={`current-game-details-${game.name}`}
          onKeyDown={(e) => handleKeyDown(e, game.name)}
          title={`${game.name} — показать детали`}
        >
          <img 
            src={game.image} 
            alt={game.name}
            className="games-current-image"
            onLoad={handleImageLoad}
          />
          <div className="games-current-content">
            <h3 className="games-current-title">{game.name}</h3>
            <div className="games-current-hours">{game.hours} часов</div>
            
            <div className="games-current-progress">
              <div className="games-current-progress-label">
                Прогресс: {game.progress}%
              </div>
              <div className="games-current-progress-bar">
                <div 
                  className="games-current-progress-fill"
                  style={{ width: `${game.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-sm text-gray-400 mb-4">
              Последний запуск: {game.lastLaunch}
            </div>
            
            {openGame === game.name && (
              <div id={`current-game-details-${game.name}`} className="games-details border-t border-gray-600 pt-4">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-white">Достижения:</h4>
                  <p className="text-sm text-gray-400">{game.achievements}</p>
                </div>
                <div className="games-current-actions">
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
              className="btn btn-toggle mt-4"
              aria-expanded={openGame === game.name}
              aria-controls={`current-game-details-${game.name}`}
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
