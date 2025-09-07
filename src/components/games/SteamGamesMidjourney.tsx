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

  return (
    <>
      {displayedGames.map((game) => (
        <div 
          key={game.name} 
          className="games-card games-animate-scale"
          style={{ backgroundImage: `url(${game.image})` }}
          onClick={() => openGameModal(game)}
        >
          <div className="games-card-content">
            <h3 className="games-card-title">{game.name}</h3>
            <div className="games-card-hours">{game.hours} часов</div>
            <div className="games-card-actions">
              <button 
                className="games-card-btn primary"
                data-action="screenshots"
                data-game={game.name}
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fas fa-images"></i>
              </button>
              <button 
                className="games-card-btn"
                data-action="achievements"
                data-game={game.name}
                onClick={(e) => e.stopPropagation()}
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
        >
          <div className="games-card-content flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">
                <i className="fas fa-plus-circle text-blue-500"></i>
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
        <div className="games-modal" onClick={closeGameModal}>
          <div 
            className="games-modal-content games-modal-with-bg" 
            style={{ backgroundImage: `url(${selectedGame.image})` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="games-modal-overlay"></div>
            <div className="games-modal-header">
              <h2 className="games-modal-title">{selectedGame.name}</h2>
              <button className="games-modal-close" onClick={closeGameModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="games-modal-body">
              <div className="space-y-4">
                <div className="games-modal-info">
                  <div className="games-modal-stat">
                    <i className="fas fa-clock mr-2"></i>
                    <span>Часы в игре: {selectedGame.hours}</span>
                  </div>
                  <div className="games-modal-stat">
                    <i className="fas fa-calendar mr-2"></i>
                    <span>Последний запуск: {selectedGame.lastLaunch}</span>
                  </div>
                  <div className="games-modal-stat">
                    <i className="fas fa-trophy mr-2"></i>
                    <span>Достижения: {selectedGame.achievements}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="games-card-btn primary"
                    data-action="screenshots"
                    data-game={selectedGame.name}
                  >
                    <i className="fas fa-images mr-2"></i>
                    Скриншоты
                  </button>
                  <button 
                    className="games-card-btn"
                    data-action="achievements"
                    data-game={selectedGame.name}
                  >
                    <i className="fas fa-trophy mr-2"></i>
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
