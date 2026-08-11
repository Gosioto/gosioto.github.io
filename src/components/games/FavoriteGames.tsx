'use client';

import { topGames } from '@/data/gamesData';
import { Game } from '@/types/game';

interface FavoriteGamesProps {
  onSelectGame: (game: Game) => void;
}

export default function FavoriteGames({ onSelectGame }: FavoriteGamesProps) {
  return (
    <section className="gp-section" id="favorites">
      <div className="gp-section-head">
        <h2 className="gp-section-title">Топ-5 любимых</h2>
        <p className="gp-section-sub">Нажми на карточку — иконка, детали и галерея скриншотов.</p>
      </div>

      <div className="gp-fav-grid">
        {topGames.map((game) => {
          const bg = game.coverLocal || game.image;

          return (
            <button
              key={game.rank}
              type="button"
              className="gp-fav-card"
              onClick={() => onSelectGame(game)}
            >
              <div className="gp-fav-bg" style={{ backgroundImage: `url(${bg})` }} />
              <div className="gp-fav-shade" />
              <div className="gp-fav-body">
                <span className="gp-fav-rank">№{game.rank}</span>
                <h3 className="gp-fav-name">{game.name}</h3>
                <p className="gp-fav-meta">
                  {game.hours.toLocaleString('ru-RU')} ч
                  {game.achievements && game.achievements !== '-'
                    ? ` · ${game.achievements}`
                    : ''}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
