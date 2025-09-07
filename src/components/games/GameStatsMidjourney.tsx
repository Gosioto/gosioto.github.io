// src/components/games/GameStatsMidjourney.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function GameStatsMidjourney() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const animateValue = (element: HTMLElement, start: number, end: number, duration: number, suffix = '') => {
      let startTime: number | null = null;
      
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString() + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      
      requestAnimationFrame(step);
    };

    const animatePercent = (element: HTMLElement, start: number, end: number, duration: number) => {
      let startTime: number | null = null;
      
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + '%';
        
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      
      requestAnimationFrame(step);
    };

    const hoursElement = document.querySelector('.games-stat-number[data-target="10000"]');
    if (hoursElement && !hoursElement.getAttribute('data-animated')) {
      animateValue(hoursElement as HTMLElement, 0, 10000, 2000);
      hoursElement.setAttribute('data-animated', 'true');
    }

    const percentElement = document.querySelector('.games-stat-number[data-target="73"]');
    if (percentElement && !percentElement.getAttribute('data-animated')) {
      animatePercent(percentElement as HTMLElement, 0, 73, 2000);
      percentElement.setAttribute('data-animated', 'true');
    }

    const gamesElement = document.querySelector('.games-stat-number[data-target="100"]');
    if (gamesElement && !gamesElement.getAttribute('data-animated')) {
      animateValue(gamesElement as HTMLElement, 0, 100, 2000);
      gamesElement.setAttribute('data-animated', 'true');
    }
  };

  return (
    <div className="games-stats-grid" ref={statsRef}>
      <div className="games-stat-card games-scroll-reveal">
        <div className="games-stat-icon">
          <i className="fas fa-hourglass-half"></i>
        </div>
        <div className="games-stat-number" data-target="10000">0</div>
        <div className="games-stat-label">Часов в играх</div>
        <div className="games-stat-description">Опыт в виртуальных мирах</div>
      </div>
      
      <div className="games-stat-card games-scroll-reveal">
        <div className="games-stat-icon">
          <i className="fas fa-trophy"></i>
        </div>
        <div className="games-stat-number" data-target="73">0</div>
        <div className="games-stat-label">Достижений Steam</div>
        <div className="games-stat-description">Высокий процент завершения</div>
      </div>
      
      <div className="games-stat-card games-scroll-reveal">
        <div className="games-stat-icon">
          <i className="fas fa-gamepad"></i>
        </div>
        <div className="games-stat-number" data-target="100">0</div>
        <div className="games-stat-label">Игр в коллекции</div>
        <div className="games-stat-description">От инди до AAA-проектов</div>
      </div>
    </div>
  );
}
