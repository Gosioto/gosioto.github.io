// src/components/games/SteamGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { gamesData } from '@/data/gamesData';

export default function SteamGamesMidjourney() {
  const [showAll, setShowAll] = useState(false);
  const [openGame, setOpenGame] = useState<string | null>(null);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const displayedGames = showAll ? gamesData : gamesData.slice(0, 12);

  const toggleGame = (gameName: string) => {
    setOpenGame(openGame === gameName ? null : gameName);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, gameName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleGame(gameName);
    }
  };

  const handleShowAllKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowAll(true);
    }
  };

  return (
    <div className="steam-games-grid">
      {displayedGames.map((game) => (
        <div 
          key={game.name} 
          className={`steam-game-card ${openGame === game.name ? 'expanded' : ''} ${hoveredGame === game.name ? 'hovered' : ''}`}
          style={{
            backgroundImage: `url(${game.image})`,
            '--animation-delay': `${displayedGames.indexOf(game) * 0.05}s`
          } as React.CSSProperties}
          onMouseEnter={() => setHoveredGame(game.name)}
          onMouseLeave={() => setHoveredGame(null)}
          onClick={() => toggleGame(game.name)}
          role="button"
          tabIndex={0}
          aria-expanded={openGame === game.name}
          aria-controls={`steam-game-details-${game.name}`}
          onKeyDown={(e) => handleCardKeyDown(e, game.name)}
          title={`${game.name} — показать детали`}
        >
          {/* Corner Decoration */}
          <div className="corner-decoration"></div>

          {/* Game Content */}
          <div className="game-content">
            {/* Header */}
            <div className="game-header">
              <h3 className="game-title">{game.name}</h3>
              <div className="game-steam-badge">
                Steam
              </div>
            </div>

            {/* Stats */}
            <div className="game-stats">
              <div className="stat-item">
                <i className="fas fa-clock text-blue-400"></i>
                <span>{game.hours} ч</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-calendar text-green-400"></i>
                <span>{game.lastLaunch}</span>
              </div>
            </div>

            {/* Expandable Details */}
            {openGame === game.name && (
              <div
                id={`steam-game-details-${game.name}`}
                className="game-details"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="details-content">
                  <div className="achievement-info">
                    <i className="fas fa-trophy text-yellow-400"></i>
                    <span>Достижения: {game.achievements}</span>
                  </div>

                  <div className="action-buttons">
                    <button
                      className="action-btn primary"
                      data-action="screenshots"
                      data-game={game.name}
                      aria-label={`Скриншоты: ${game.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-images"></i>
                      <span>Скриншоты</span>
                    </button>
                    <button
                      className="action-btn secondary"
                      data-action="achievements"
                      data-game={game.name}
                      aria-label={`Достижения: ${game.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-trophy"></i>
                      <span>Достижения</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGame(game.name);
              }}
              className={`toggle-btn ${openGame === game.name ? 'expanded' : ''}`}
              aria-expanded={openGame === game.name}
              aria-controls={`steam-game-details-${game.name}`}
            >
              <span>{openGame === game.name ? 'Скрыть детали' : 'Показать детали'}</span>
              <i className={`fas fa-chevron-down ${openGame === game.name ? 'rotated' : ''}`}></i>
            </button>
          </div>

          {/* Hover Overlay */}
          <div className="hover-overlay"></div>
        </div>
      ))}

      {!showAll && gamesData.length > 12 && (
        <div 
          className="steam-game-card steam-show-all-card" 
          onClick={() => setShowAll(true)}
          role="button"
          tabIndex={0}
          aria-label="Показать все игры"
          onKeyDown={handleShowAllKeyDown}
          title="Показать все игры"
        >
          <div className="game-content flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">
                <i className="fas fa-plus-circle text-blue-500" aria-hidden="true"></i>
              </div>
              <h3 className="game-title">Показать все</h3>
              <div className="text-sm text-gray-400">
                +{gamesData.length - 12} игр
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
