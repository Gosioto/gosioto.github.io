'use client';

import { profileMeta } from '@/data/gamesData';

export default function GamesHero() {
  return (
    <section className="gp-hero" aria-label="Игровой профиль">
      <div
        className="gp-hero-media"
        style={{ backgroundImage: `url(${profileMeta.heroImage})` }}
        role="img"
        aria-label="Скриншот The Witcher 3"
      />
      <div className="gp-hero-inner">
        <h1 className="gp-brand">
          Gosloto <span>Games</span>
        </h1>
        <p className="gp-hero-lead">{profileMeta.tagline}</p>
        <div className="gp-cta-row">
          <a
            className="gp-btn gp-btn-primary"
            href={profileMeta.steamUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Профиль Steam
          </a>
          <a className="gp-btn gp-btn-ghost" href="#favorites">
            Любимые игры
          </a>
        </div>
      </div>
    </section>
  );
}
