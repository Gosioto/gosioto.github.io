'use client';

import { recentGames } from '@/data/gamesData';
import { Game } from '@/types/game';

interface RecentGamesProps {
  onSelectGame: (game: Game) => void;
}

export default function RecentGames({ onSelectGame }: RecentGamesProps) {
  return (
    <section className="gp-section" id="recent">
      <div className="gp-section-head">
        <h2 className="gp-section-title">Последние 5</h2>
        <p className="gp-section-sub">Недавняя активность в Steam — снимок профиля.</p>
      </div>

      <div className="gp-recent-list">
        {recentGames.map((game) => (
          <button
            key={game.name}
            type="button"
            className="gp-recent-card"
            onClick={() => onSelectGame(game)}
          >
            <div
              className="gp-recent-thumb"
              style={{ backgroundImage: `url(${game.image})` }}
              role="img"
              aria-label={game.name}
            />
            <div className="gp-recent-body">
              <h3 className="gp-recent-name">{game.name}</h3>
              <p className="gp-recent-meta">
                {game.hours.toLocaleString('ru-RU')} ч всего
                {game.achievements && game.achievements !== '-'
                  ? ` · ${game.achievements}`
                  : ''}
              </p>
              {typeof game.hours2Weeks === 'number' && (
                <span className="gp-recent-badge">{game.hours2Weeks} ч за 2 недели</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
