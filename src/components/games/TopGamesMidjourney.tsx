// src/components/games/TopGamesMidjourney.tsx
'use client';

import { useState } from 'react';
import { topGames } from '@/data/gamesData';

export default function TopGamesMidjourney() {
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'fas fa-crown';
      case 2: return 'fas fa-medal';
      case 3: return 'fas fa-award';
      default: return 'fas fa-star';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  // Разделяем игры на группы для специального расположения
  const topThreeGames = topGames.filter(game => game.rank <= 3);
  const bottomTwoGames = topGames.filter(game => game.rank > 3);

  return (
    <div className="top-games-pyramid">
      {/* Верхний ряд: топ-3 игры */}
      <div className="top-games-row top-row">
        {topThreeGames.map((game, index) => (
        <div
          key={game.name}
          className={`top-game-card ${openGame === game.name ? 'expanded' : ''} ${hoveredGame === game.name ? 'hovered' : ''}`}
          style={{ 
            backgroundImage: `url(${game.image})`,
            '--animation-delay': `${index * 0.1}s`
          } as React.CSSProperties}
          onMouseEnter={() => setHoveredGame(game.name)}
          onMouseLeave={() => setHoveredGame(null)}
          onClick={() => toggleGame(game.name)}
          role="button"
          tabIndex={0}
          aria-expanded={openGame === game.name}
          aria-controls={`top-game-details-${game.name}`}
          onKeyDown={(e) => handleKeyDown(e, game.name)}
          title={`${game.name} — показать детали`}
        >
          {/* Rank Badge */}
          <div className={`rank-badge rank-${game.rank}`}>
            <i className={`${getRankIcon(game.rank)} ${getRankColor(game.rank)}`}></i>
            <span className="rank-number">№{game.rank}</span>
          </div>

          {/* Large Rank Number */}
          <div className={`large-rank-number rank-${game.rank}`}>
            №{game.rank}
          </div>

          {/* Corner Decoration */}
          <div className="corner-decoration"></div>

          {/* Game Content */}
          <div className="game-content">
            {/* Header */}
            <div className="game-header">
              <h3 className="game-title">{game.name}</h3>
              <div className={`game-rank-badge bg-gradient-to-r ${getRankGradient(game.rank)}`}>
                Топ-{game.rank}
              </div>
            </div>

            {/* Stats */}
            <div className="game-stats">
              <div className="stat-item">
                <i className="fas fa-clock text-blue-400"></i>
                <span>{game.hours.toLocaleString()} ч</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-calendar text-green-400"></i>
                <span>{game.lastLaunch}</span>
              </div>
            </div>

            {/* Expandable Details */}
            {openGame === game.name && (
              <div 
                id={`top-game-details-${game.name}`} 
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
              aria-controls={`top-game-details-${game.name}`}
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

      {/* Нижний ряд: игры №4 и №5 по центру */}
      <div className="top-games-row bottom-row">
        {bottomTwoGames.map((game, index) => (
        <div
          key={game.name}
          className={`top-game-card ${openGame === game.name ? 'expanded' : ''} ${hoveredGame === game.name ? 'hovered' : ''}`}
          style={{ 
            backgroundImage: `url(${game.image})`,
            '--animation-delay': `${(index + 3) * 0.1}s`
          } as React.CSSProperties}
          onMouseEnter={() => setHoveredGame(game.name)}
          onMouseLeave={() => setHoveredGame(null)}
          onClick={() => toggleGame(game.name)}
          role="button"
          tabIndex={0}
          aria-expanded={openGame === game.name}
          aria-controls={`top-game-details-${game.name}`}
          onKeyDown={(e) => handleKeyDown(e, game.name)}
          title={`${game.name} — показать детали`}
        >
          {/* Rank Badge */}
          <div className={`rank-badge rank-${game.rank}`}>
            <i className={`${getRankIcon(game.rank)} ${getRankColor(game.rank)}`}></i>
            <span className="rank-number">№{game.rank}</span>
          </div>

          {/* Large Rank Number */}
          <div className={`large-rank-number rank-${game.rank}`}>
            №{game.rank}
          </div>

          {/* Corner Decoration */}
          <div className="corner-decoration"></div>

          {/* Game Content */}
          <div className="game-content">
            {/* Header */}
            <div className="game-header">
              <h3 className="game-title">{game.name}</h3>
              <div className={`game-rank-badge bg-gradient-to-r ${getRankGradient(game.rank)}`}>
                Топ-{game.rank}
              </div>
            </div>

            {/* Stats */}
            <div className="game-stats">
              <div className="stat-item">
                <i className="fas fa-clock text-blue-400"></i>
                <span>{game.hours.toLocaleString()} ч</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-calendar text-green-400"></i>
                <span>{game.lastLaunch}</span>
              </div>
            </div>

            {/* Expandable Details */}
            {openGame === game.name && (
              <div
                id={`top-game-details-${game.name}`}
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
              aria-controls={`top-game-details-${game.name}`}
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
    </div>
  );
}
