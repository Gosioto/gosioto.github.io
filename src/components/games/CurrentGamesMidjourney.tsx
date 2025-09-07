// src/components/games/CurrentGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { currentGames } from '@/data/gamesData';

export default function CurrentGamesMidjourney() {
  const [openGame, setOpenGame] = useState<string | null>(null);

  const toggleGame = (gameName: string) => {
    setOpenGame(openGame === gameName ? null : gameName);
  };

  return (
    <>
      {currentGames.map((game) => (
        <div 
          key={game.name} 
          className={`games-current-item games-animate-scale ${openGame === game.name ? 'border-blue-500' : ''}`}
        >
          <img 
            src={game.image} 
            alt={game.name}
            className="games-current-image"
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
              <div className="border-t border-gray-600 pt-4">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-white">Достижения:</h4>
                  <p className="text-sm text-gray-400">{game.achievements}</p>
                </div>
                <div className="games-current-actions">
                  <button 
                    className="games-card-btn primary"
                    data-action="screenshots"
                    data-game={game.name}
                  >
                    <i className="fas fa-images mr-2"></i>
                    Скриншоты
                  </button>
                  <button 
                    className="games-card-btn"
                    data-action="achievements"
                    data-game={game.name}
                  >
                    <i className="fas fa-trophy mr-2"></i>
                    Достижения
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={() => toggleGame(game.name)}
              className="games-card-btn mt-4"
            >
              {openGame === game.name ? 'Скрыть детали' : 'Показать детали'}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
