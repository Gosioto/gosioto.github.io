// src/components/games/TopGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { topGames } from '@/data/gamesData';

export default function TopGamesMidjourney() {
  const [openGame, setOpenGame] = useState<string | null>(null);

  const toggleGame = (gameName: string) => {
    setOpenGame(openGame === gameName ? null : gameName);
  };

  return (
    <>
      {topGames.map((game, index) => (
        <div key={game.name} className="games-top-card games-animate-scale">
          <img 
            src={game.image} 
            alt={game.name}
            className="games-top-card-image"
          />
          <div className="games-top-card-content">
            <h3 className="games-top-card-title">{game.name}</h3>
            <div className="games-top-card-hours">{game.hours} часов</div>
            <div className="games-top-card-rank">Топ-{game.rank}</div>
            
            {openGame === game.name && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-400">
                    <strong>Последний запуск:</strong> {game.lastLaunch}
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Достижения:</strong> {game.achievements}
                  </p>
                </div>
                <div className="games-card-actions">
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
              className="w-full mt-3 games-card-btn"
            >
              {openGame === game.name ? 'Скрыть детали' : 'Показать детали'}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
