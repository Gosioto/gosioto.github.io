'use client';

import { useState } from 'react';
import { Game } from '@/types/game';
import GamesHeaderBar from './GamesHeaderBar';
import GamesHero from './GamesHero';
import FavoriteGames from './FavoriteGames';
import RecentGames from './RecentGames';
import GamesScreenshotsSection from './GamesScreenshotsSection';
import GamesSecondary from './GamesSecondary';
import SteamDock from './SteamDock';
import GameDetailModal from './GameDetailModal';

export default function GamesProfilePage() {
  const [selected, setSelected] = useState<Game | null>(null);

  return (
    <div className="gp" id="top">
      <GamesHeaderBar />
      <GamesHero />
      <main className="gp-main">
        <FavoriteGames onSelectGame={setSelected} />
        <RecentGames onSelectGame={setSelected} />
        <GamesScreenshotsSection />
        <GamesSecondary onSelectGame={setSelected} />
      </main>
      <SteamDock />
      <GameDetailModal game={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
