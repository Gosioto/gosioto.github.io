// src/components/games/CurrentGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { currentGames } from '@/data/gamesData';

export default function CurrentGamesMidjourney() {
  const [openGame, setOpenGame] = useState<string | null>(null);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

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
          className={`current-game-card ${openGame === game.name ? 'expanded' : ''} ${hoveredGame === game.name ? 'hovered' : ''}`}
          style={{
            backgroundImage: `url(${game.image})`,
            '--animation-delay': `${currentGames.indexOf(game) * 0.1}s`
          } as React.CSSProperties}
          onMouseEnter={() => setHoveredGame(game.name)}
          onMouseLeave={() => setHoveredGame(null)}
          onClick={() => toggleGame(game.name)}
          role="button"
          tabIndex={0}
          aria-expanded={openGame === game.name}
          aria-controls={`current-game-details-${game.name}`}
          onKeyDown={(e) => handleKeyDown(e, game.name)}
          title={`${game.name} — показать детали`}
        >
          {/* Corner Decoration */}
          <div className="corner-decoration"></div>

          {/* Game Content */}
          <div className="game-content">
            {/* Header */}
            <div className="game-header">
              <h3 className="game-title">{game.name}</h3>
              <div className="game-status-badge">
                Сейчас играю
              </div>
            </div>

            {/* Stats */}
            <div className="game-stats">
              <div className="stat-item">
                <i className="fas fa-clock text-blue-400"></i>
                <span>{game.hours} ч</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-percentage text-green-400"></i>
                <span>{game.progress}%</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-calendar text-purple-400"></i>
                <span>{game.lastLaunch}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
              <div className="progress-label">Прогресс прохождения</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${game.progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Expandable Details */}
            {openGame === game.name && (
              <div
                id={`current-game-details-${game.name}`}
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
              aria-controls={`current-game-details-${game.name}`}
            >
              <span>{openGame === game.name ? 'Скрыть детали' : 'Показать детали'}</span>
              <i className={`fas fa-chevron-down ${openGame === game.name ? 'rotated' : ''}`}></i>
            </button>
          </div>

          {/* Hover Overlay */}
          <div className="hover-overlay"></div>
        </div>
      ))}
    </>
  );
}
