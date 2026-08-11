// src/app/hobbies/games/page.tsx
'use client';

import Footer from '@/components/Footer';
import NewsTab from '@/components/NewsTab';
import ScrollToTop from '@/components/ScrollToTop';
import GamesProfilePage from '@/components/games/GamesProfilePage';
import '@/styles/games-profile.css';

export default function HobbiesGamesPage() {
  return (
    <>
      <GamesProfilePage />
      <Footer />
      <NewsTab />
      <ScrollToTop />
    </>
  );
}
