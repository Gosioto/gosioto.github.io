// src/components/games/GameModalButtons.tsx
'use client';

import { useState } from 'react';
import GameDetailsModal from './GameDetailsModal';
import GameScreenshotsModal from './GameScreenshotsModal';
import AchievementsModal from './AchievementsModal';

export default function GameModalButtons() {
  const [detailsModal, setDetailsModal] = useState(false);
  const [screenshotsModal, setScreenshotsModal] = useState(false);
  const [achievementsModal, setAchievementsModal] = useState(false);

  const mockScreenshots = [
    '/img/screenshot/screenshot1.jpg',
    '/img/screenshot/screenshot2.jpg',
    '/img/screenshot/screenshot3.jpg',
    '/img/screenshot/screenshot1.jpg',
    '/img/screenshot/screenshot2.jpg'
  ];


  return (
    <>
      <div className="games-dropdown-menu">
        {/* Dropdown content */}
        <div className="games-dropdown-content">
          {/* Подробнее */}
          <button
            onClick={() => setDetailsModal(true)}
            className="games-dropdown-button info"
          >
            <i className="fas fa-info-circle"></i>
            <span>Подробнее</span>
          </button>

          {/* Скриншоты */}
          <button
            onClick={() => setScreenshotsModal(true)}
            className="games-dropdown-button screenshots"
          >
            <i className="fas fa-images"></i>
            <span>Скриншоты</span>
          </button>

          {/* Достижения */}
          <button
            onClick={() => setAchievementsModal(true)}
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
