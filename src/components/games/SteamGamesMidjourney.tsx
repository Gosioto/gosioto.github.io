// src/components/games/SteamGamesMidjourney.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { gamesData } from '@/data/gamesData';

export default function SteamGamesMidjourney() {
  const [visibleRows, setVisibleRows] = useState(1); // Начинаем с 1 ряда
  const [openGame, setOpenGame] = useState<string | null>(null);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  
  const GAMES_PER_ROW = 3; // 3 игры в ряду
  const MAX_ROWS = Math.ceil(gamesData.length / GAMES_PER_ROW);
  
  const displayedGames = gamesData.slice(0, visibleRows * GAMES_PER_ROW);

  const toggleGame = (gameName: string) => {
    setOpenGame(openGame === gameName ? null : gameName);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, gameName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleGame(gameName);
    }
  };

  // Функция для загрузки следующего ряда
  const loadNextRow = useCallback(() => {
    if (visibleRows < MAX_ROWS && !isLoading) {
      setIsLoading(true);
      
      // Имитируем задержку загрузки для плавности
      setTimeout(() => {
        setVisibleRows(prev => Math.min(prev + 1, MAX_ROWS));
        setIsLoading(false);
      }, 300);
    }
  }, [visibleRows, MAX_ROWS, isLoading]);

  // Настройка Intersection Observer
  useEffect(() => {
    if (!triggerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadNextRow();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Загружаем заранее
      }
    );

    observerRef.current.observe(triggerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadNextRow]);

  // Разделяем игры по рядам
  const gameRows = [];
  for (let i = 0; i < displayedGames.length; i += GAMES_PER_ROW) {
    gameRows.push(displayedGames.slice(i, i + GAMES_PER_ROW));
  }

  return (
    <div className="steam-games-container">
      {/* Рендерим игры по рядам */}
      {gameRows.map((rowGames, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`steam-games-row ${rowIndex < visibleRows ? 'visible' : 'hidden'}`}
          style={{ '--row-delay': `${rowIndex * 0.2}s` } as React.CSSProperties}
        >
          {rowGames.map((game, gameIndex) => (
            <div 
              key={game.name} 
              className={`steam-game-card ${openGame === game.name ? 'expanded' : ''} ${hoveredGame === game.name ? 'hovered' : ''}`}
              style={{
                backgroundImage: `url(${game.image})`,
                '--animation-delay': `${(rowIndex * GAMES_PER_ROW + gameIndex) * 0.1}s`
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
        </div>
      ))}

      {/* Триггер для загрузки следующего ряда */}
      {visibleRows < MAX_ROWS && (
        <div 
          ref={triggerRef}
          className="steam-load-trigger"
          style={{ height: '100px' }}
        >
          {isLoading && (
            <div className="steam-loading-indicator">
              <div className="loading-spinner"></div>
              <span>Загружаем следующий ряд...</span>
            </div>
          )}
        </div>
      )}

      {/* Индикатор прогресса */}
      <div className="steam-progress-indicator">
        <div className="progress-text">
          Показано {displayedGames.length} из {gamesData.length} игр
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(displayedGames.length / gamesData.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
