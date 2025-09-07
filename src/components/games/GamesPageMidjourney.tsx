// src/components/games/GamesPageMidjourney.tsx
'use client';

import { useEffect, ReactNode, useState } from 'react';
import ScreenshotsModal from './ScreenshotsModal';
import AchievementsModal from './AchievementsModal';
import GameStatsMidjourney from './GameStatsMidjourney';
import { AnimationUtils } from '@/utils/animations';

interface GamesPageMidjourneyProps {
  children: ReactNode;
}

export default function GamesPageMidjourney({ children }: GamesPageMidjourneyProps) {
  const [screenshotsModal, setScreenshotsModal] = useState<{
    isOpen: boolean;
    gameName: string;
    screenshots: string[];
  }>({
    isOpen: false,
    gameName: '',
    screenshots: []
  });

  const [achievementsModal, setAchievementsModal] = useState<{
    isOpen: boolean;
    gameName: string;
    achievements: any[];
  }>({
    isOpen: false,
    gameName: '',
    achievements: []
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Initialize animations
    AnimationUtils.initAll();

    // Handle scroll effects
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      setIsScrolled(scrolled > 50);
      
      // Parallax effect for hero background
      const heroBg = document.querySelector('.games-hero-bg') as HTMLElement;
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    // Handle screenshots button clicks
    const handleScreenshotsClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.games-card-btn[data-action="screenshots"]');
      if (button) {
        const gameName = button.getAttribute('data-game');
        if (gameName) {
          const mockScreenshots = [
            `/img/screenshot/screenshot1.jpg`,
            `/img/screenshot/screenshot2.jpg`,
            `/img/screenshot/screenshot3.jpg`,
            `/img/screenshot/screenshot1.jpg`,
            `/img/screenshot/screenshot2.jpg`
          ];
          setScreenshotsModal({
            isOpen: true,
            gameName,
            screenshots: mockScreenshots
          });
        }
      }
    };

    // Handle achievements button clicks
    const handleAchievementsClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.games-card-btn[data-action="achievements"]');
      if (button) {
        const gameName = button.getAttribute('data-game');
        if (gameName) {
          const mockAchievements = [
            {
              id: '1',
              name: 'Первые шаги',
              description: 'Завершите обучение',
              icon: 'fas fa-graduation-cap',
              unlocked: true,
              unlockedAt: '2024-01-15',
              rarity: 'common' as const
            },
            {
              id: '2',
              name: 'Мастер боя',
              description: 'Победите 100 врагов',
              icon: 'fas fa-sword',
              unlocked: true,
              unlockedAt: '2024-02-20',
              rarity: 'rare' as const
            },
            {
              id: '3',
              name: 'Легенда',
              description: 'Завершите игру на максимальной сложности',
              icon: 'fas fa-crown',
              unlocked: false,
              rarity: 'legendary' as const
            }
          ];
          setAchievementsModal({
            isOpen: true,
            gameName,
            achievements: mockAchievements
          });
        }
      }
    };

    // Scroll reveal animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.games-scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleScreenshotsClick);
    document.addEventListener('click', handleAchievementsClick);

    // Cleanup
    return () => {
      AnimationUtils.cleanup();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleScreenshotsClick);
      document.removeEventListener('click', handleAchievementsClick);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="games-page-midjourney">
      {/* Navigation */}
      <nav className={`games-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="games-nav-content">
          <a href="/" className="games-nav-logo">
            Gosloto
          </a>
          <div className="games-nav-links">
            <a href="/hobbies" className="games-nav-link">
              <i className="fas fa-arrow-left mr-2"></i>
              Назад к хобби
            </a>
            <a href="/contact" className="games-nav-link">
              Контакты
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="games-hero">
        <div className="games-hero-bg"></div>
        <div className="games-hero-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
        <div className="games-hero-overlay"></div>
        <div className="games-hero-content games-animate-in">
          <h1 className="games-hero-title">
            Игровая Вселенная
          </h1>
          <p className="games-hero-subtitle">
            От ретро-классики до современных AAA-проектов. Более 10,000 часов в виртуальных мирах.
          </p>
          <div className="games-hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">10,000+</div>
              <div className="hero-stat-label">Часов в играх</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">100+</div>
              <div className="hero-stat-label">Игр в коллекции</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">73%</div>
              <div className="hero-stat-label">Достижений Steam</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="games-main">
        {/* Stats Section */}
        <section className="games-section">
          <div className="games-section-header games-scroll-reveal">
            <h2 className="games-section-title">Статистика</h2>
            <p className="games-section-subtitle">
              Цифры, которые говорят больше чем слова
            </p>
          </div>
          
          <GameStatsMidjourney />
        </section>

        {/* Top Games Section */}
        <section className="games-section">
          <div className="games-section-header games-scroll-reveal">
            <h2 className="games-section-title">Топ-5 любимых игр</h2>
            <p className="games-section-subtitle">
              Игры, которые оставили наибольшее впечатление
            </p>
          </div>
          
          <div className="games-top-section">
            <div className="games-top-grid">
              {Array.isArray(children) && children[1] && (
                <div className="games-scroll-reveal">
                  {children[1]}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Current Games Section */}
        <section className="games-section">
          <div className="games-section-header games-scroll-reveal">
            <h2 className="games-section-title">Сейчас играю</h2>
            <p className="games-section-subtitle">
              Активные проекты и текущие достижения
            </p>
          </div>
          
          <div className="games-current-section">
            <div className="games-current-list">
              {Array.isArray(children) && children[2] && (
                <div className="games-scroll-reveal">
                  {children[2]}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Steam Games Section */}
        <section className="games-section">
          <div className="games-section-header games-scroll-reveal">
            <h2 className="games-section-title">Коллекция Steam</h2>
            <p className="games-section-subtitle">
              Полная библиотека игр с детальной статистикой
            </p>
          </div>
          
          <div className="games-grid">
            {Array.isArray(children) && children[3] && (
              <div className="games-scroll-reveal">
                {children[3]}
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <section className="games-section">
          <div className="games-sidebar">
            {Array.isArray(children) && children[4] && (
              <div className="games-scroll-reveal">
                {children[4]}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <ScreenshotsModal
        gameName={screenshotsModal.gameName}
        isOpen={screenshotsModal.isOpen}
        onClose={() => setScreenshotsModal(prev => ({ ...prev, isOpen: false }))}
        screenshots={screenshotsModal.screenshots}
      />

      <AchievementsModal
        gameName={achievementsModal.gameName}
        isOpen={achievementsModal.isOpen}
        onClose={() => setAchievementsModal(prev => ({ ...prev, isOpen: false }))}
        achievements={achievementsModal.achievements}
      />
    </div>
  );
}
