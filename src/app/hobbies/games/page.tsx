// src/app/hobbies/games/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import GamesPageMidjourney from '@/components/games/GamesPageMidjourney';
import TopGamesMidjourney from '@/components/games/TopGamesMidjourney';
import CurrentGamesMidjourney from '@/components/games/CurrentGamesMidjourney';
import SteamGamesMidjourney from '@/components/games/SteamGamesMidjourney';
import Footer from '@/components/Footer';
import NewsTab from '@/components/NewsTab';
import ScrollToTop from '@/components/ScrollToTop';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="games-page-wrapper">
      <Header />
      <GamesPageMidjourney>
        <TopGamesMidjourney />
        <CurrentGamesMidjourney />
        <SteamGamesMidjourney />
      </GamesPageMidjourney>
      <Footer />
      <NewsTab />
      <ScrollToTop />
    </div>
  );
}