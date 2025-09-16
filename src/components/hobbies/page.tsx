// src/app/hobbies/page.tsx
'use client';

import HobbiesPageSection from '@/components/hobbies/HobbiesPageSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsTab from '@/components/NewsTab';

export default function HobbiesPage() {
  return (
    <div>
      <Header />
      <main>
        <HobbiesPageSection />
      </main>
      <Footer />
      <NewsTab />
    </div>
  );
}
