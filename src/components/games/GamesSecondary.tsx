'use client';

import { useMemo, useState } from 'react';
import { gamesData, gameStats, profileMeta } from '@/data/gamesData';
import { Game } from '@/types/game';

const INITIAL_ROWS = 9;
const STEP = 9;

interface GamesSecondaryProps {
  onSelectGame: (game: Game) => void;
}

export default function GamesSecondary({ onSelectGame }: GamesSecondaryProps) {
  const sorted = useMemo(() => [...gamesData].sort((a, b) => b.hours - a.hours), []);
  const [visible, setVisible] = useState(INITIAL_ROWS);
  const slice = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <section className="gp-section" id="library">
      <div className="gp-section-head">
        <h2 className="gp-section-title">Библиотека и цифры</h2>
        <p className="gp-section-sub">
          Вторичная сводка. Уровень профиля: {profileMeta.level}. Клик по игре открывает галерею.
        </p>
      </div>

      <div className="gp-stats">
        <div className="gp-stat">
          <p className="gp-stat-value">{gameStats.totalHours.toLocaleString('ru-RU')}+</p>
          <p className="gp-stat-label">Часов в играх</p>
        </div>
        <div className="gp-stat">
          <p className="gp-stat-value">{gameStats.totalGames}</p>
          <p className="gp-stat-label">Игр в снимке</p>
        </div>
        <div className="gp-stat">
          <p className="gp-stat-value">{gameStats.achievementPercentage}%</p>
          <p className="gp-stat-label">Ачивок (трек.)</p>
        </div>
        <div className="gp-stat">
          <p className="gp-stat-value">{gameStats.perfectAchievements.toLocaleString('ru-RU')}</p>
          <p className="gp-stat-label">В идеальных играх</p>
        </div>
      </div>

      <div className="gp-library">
        {slice.map((game) => (
          <button
            key={`${game.appId}-${game.name}`}
            type="button"
            className="gp-lib-card"
            onClick={() => onSelectGame(game)}
          >
            <img src={game.image} alt="" loading="lazy" width={96} height={45} />
            <div>
              <h3 className="gp-lib-name">{game.name}</h3>
              <p className="gp-lib-meta">
                {game.hours.toLocaleString('ru-RU')} ч
                {game.achievements ? ` · ${game.achievements}` : ''}
              </p>
            </div>
          </button>
        ))}
      </div>

      {hasMore && (
        <div className="gp-more">
          <button
            type="button"
            className="gp-btn gp-btn-ghost"
            onClick={() => setVisible((v) => v + STEP)}
          >
            Показать ещё
          </button>
        </div>
      )}
    </section>
  );
}
