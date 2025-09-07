// src/app/hobbies/games/page.tsx
'use client';

import { useState, useEffect } from 'react';
import GamesPageMidjourney from '@/components/games/GamesPageMidjourney';
import TopGamesMidjourney from '@/components/games/TopGamesMidjourney';
import CurrentGamesMidjourney from '@/components/games/CurrentGamesMidjourney';
import SteamGamesMidjourney from '@/components/games/SteamGamesMidjourney';
import GamesSidebarMidjourney from '@/components/games/GamesSidebarMidjourney';
import GameModalButtons from '@/components/games/GameModalButtons';
import Footer from '@/components/Footer';
import NewsTab from '@/components/NewsTab';
import StubbornButton from '@/components/StubbornButton';
import '@/styles/games-midjourney.css';
import '@/styles/games-midjourney-enhanced.css';
import '@/styles/games-dropdown-menu.css';
import '@/styles/games-modals.css';
export default function HobbiesGamesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <GamesPageMidjourney>
        <div></div>
        <TopGamesMidjourney />
        <CurrentGamesMidjourney />
        <SteamGamesMidjourney />
        <GamesSidebarMidjourney />
      </GamesPageMidjourney>
      <GameModalButtons />
      <Footer />
      <NewsTab />
      <StubbornButton />
    </div>
  );
}