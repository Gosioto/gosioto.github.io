// src/app/freelance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FreelanceHeader from '@/components/freelance/FreelanceHeader';
import FreelanceHero from '@/components/freelance/FreelanceHero';
import FreelanceServices from '@/components/freelance/FreelanceServices';
import FreelanceSkills from '@/components/freelance/FreelanceSkills';
import FreelanceProjects from '@/components/freelance/FreelanceProjects';
import FreelanceContacts from '@/components/freelance/FreelanceContacts';
import FreelanceFooter from '@/components/freelance/FreelanceFooter';
import FreelanceCursor from '@/components/freelance/FreelanceCursor';
import '@/styles/freelance.css';

export default function FreelancePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`freelance-page ${isLoaded ? 'loaded' : ''}`}>
      <FreelanceCursor />
      <FreelanceHeader />
      
      <main className="freelance-main">
        <FreelanceHero />
        <FreelanceServices />
        <FreelanceSkills />
        <FreelanceProjects />
        <FreelanceContacts />
      </main>
      
      <FreelanceFooter />
    </div>
  );
}
