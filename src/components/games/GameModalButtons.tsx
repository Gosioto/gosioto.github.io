// src/components/games/GameModalButtons.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import GameDetailsModal from './GameDetailsModal';
import GameScreenshotsModal from './GameScreenshotsModal';
import AchievementsModal from './AchievementsModal';

export default function GameModalButtons() {
  const [detailsModal, setDetailsModal] = useState(false);
  const [screenshotsModal, setScreenshotsModal] = useState(false);
  const [achievementsModal, setAchievementsModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const mockScreenshots = [
    '/img/screenshot/screenshot1.jpg',
    '/img/screenshot/screenshot2.jpg',
    '/img/screenshot/screenshot3.jpg',
    '/img/screenshot/screenshot1.jpg',
    '/img/screenshot/screenshot2.jpg'
  ];


  return (
    <>
      <div
        className={`games-dropdown-menu ${dropdownOpen ? 'is-open' : ''}`}
        ref={dropdownRef}
      >
        <button
          type="button"
          className="games-dropdown-trigger"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-label="Открыть меню"
          title="Меню"
        >
          <i className="fas fa-bars"></i>
          <span className="games-dropdown-trigger-text">Меню</span>
        </button>
        <div className="games-dropdown-content">
          {/* Подробнее */}
          <button
            type="button"
            onClick={() => { setDetailsModal(true); setDropdownOpen(false); }}
            className="games-dropdown-button info"
          >
            <i className="fas fa-info-circle"></i>
            <span>Подробнее</span>
          </button>

          <button
            type="button"
            onClick={() => { setScreenshotsModal(true); setDropdownOpen(false); }}
            className="games-dropdown-button screenshots"
          >
            <i className="fas fa-images"></i>
            <span>Скриншоты</span>
          </button>

          <button
            type="button"
            onClick={() => { setAchievementsModal(true); setDropdownOpen(false); }}
            className="games-dropdown-button achievements"
          >
            <i className="fas fa-trophy"></i>
            <span>Достижения</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <GameDetailsModal
        isOpen={detailsModal}
        onClose={() => setDetailsModal(false)}
      />

      <GameScreenshotsModal
        gameName="Общие скриншоты"
        isOpen={screenshotsModal}
        onClose={() => setScreenshotsModal(false)}
        screenshots={mockScreenshots}
      />

      <AchievementsModal
        isOpen={achievementsModal}
        onClose={() => setAchievementsModal(false)}
      />
    </>
  );
}
