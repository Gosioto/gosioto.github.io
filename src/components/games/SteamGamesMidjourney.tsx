// src/components/games/SteamGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { gamesData } from '@/data/gamesData';

export default function SteamGamesMidjourney() {
  const [showAll, setShowAll] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const displayedGames = showAll ? gamesData : gamesData.slice(0, 12);

  const openGameModal = (game: any) => {
    setSelectedGame(game);
  };

  const closeGameModal = () => {
    setSelectedGame(null);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, game: any) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGameModal(game);
    }
  };

  const handleShowAllKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowAll(true);
    }
  };

  return (
    <>
      {displayedGames.map((game) => (
        <div 
          key={game.name} 
          className="games-card games-animate-scale"
          style={{ backgroundImage: `url(${game.image})` }}
          onClick={() => openGameModal(game)}
          role="button"
          tabIndex={0}
          aria-label={`Открыть детали игры ${game.name}`}
          onKeyDown={(e) => handleCardKeyDown(e, game)}
          title={`${game.name} — открыть детали`}
        >
          <div className="games-card-content">
            <h3 className="games-card-title">{game.name}</h3>
            <div className="games-card-hours">{game.hours} часов</div>
            <div className="games-card-actions" aria-label="Действия">
              <button 
                className="btn btn-primary"
                data-action="screenshots"
                data-game={game.name}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Скриншоты: ${game.name}`}
              >
                <i className="fas fa-images"></i>
                <span className="hidden md:inline">Скриншоты</span>
              </button>
              <button 
                className="btn btn-icon"
                data-tooltip="Достижения"
                data-action="achievements"
                data-game={game.name}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Достижения: ${game.name}`}
              >
                <i className="fas fa-trophy"></i>
              </button>
            </div>
          </div>
        </div>
      ))}

      {!showAll && gamesData.length > 12 && (
        <div 
          className="games-card games-animate-scale games-card-show-all" 
          onClick={() => setShowAll(true)}
          role="button"
          tabIndex={0}
          aria-label="Показать все игры"
          onKeyDown={handleShowAllKeyDown}
          title="Показать все игры"
        >
          <div className="games-card-content flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">
                <i className="fas fa-plus-circle text-blue-500" aria-hidden="true"></i>
              </div>
              <h3 className="games-card-title">Показать все</h3>
              <div className="games-card-hours">
                +{gamesData.length - 12} игр
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {selectedGame && (
        <div className="games-modal" onClick={closeGameModal} role="dialog" aria-modal="true" aria-label={`Детали игры ${selectedGame.name}`}>
          <div 
            className="games-modal-content games-modal-with-bg" 
            style={{ backgroundImage: `url(${selectedGame.image})` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="games-modal-overlay"></div>
            <div className="games-modal-header">
              <h2 className="games-modal-title">{selectedGame.name}</h2>
              <button className="btn btn-icon games-modal-close" onClick={closeGameModal} aria-label="Закрыть модальное окно">
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
            <div className="games-modal-body">
              <div className="space-y-4">
                <div className="games-modal-info">
                  <div className="games-modal-stat">
                    <i className="fas fa-clock mr-2" aria-hidden="true"></i>
                    <span>Часы в игре: {selectedGame.hours}</span>
                  </div>
                  <div className="games-modal-stat">
                    <i className="fas fa-calendar mr-2" aria-hidden="true"></i>
                    <span>Последний запуск: {selectedGame.lastLaunch}</span>
                  </div>
                  <div className="games-modal-stat">
                    <i className="fas fa-trophy mr-2" aria-hidden="true"></i>
                    <span>Достижения: {selectedGame.achievements}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary"
                    data-action="screenshots"
                    data-game={selectedGame.name}
                    aria-label={`Скриншоты: ${selectedGame.name}`}
                  >
                    <i className="fas fa-images mr-2" aria-hidden="true"></i>
                    Скриншоты
                  </button>
                  <button 
                    className="btn btn-outline"
                    data-action="achievements"
                    data-game={selectedGame.name}
                    aria-label={`Достижения: ${selectedGame.name}`}
                  >
                    <i className="fas fa-trophy mr-2" aria-hidden="true"></i>
                    Достижения
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
