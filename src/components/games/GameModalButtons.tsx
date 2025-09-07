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

  const mockAchievements = [
    {
      id: '1',
      name: 'Мастер Witcher 3',
      description: 'Завершите все основные квесты',
      icon: 'fas fa-crown',
      unlocked: true,
      unlockedAt: '2024-01-15',
      rarity: 'legendary' as const
    },
    {
      id: '2',
      name: 'Выживший GTFO',
      description: 'Пройдите все уровни сложности',
      icon: 'fas fa-skull',
      unlocked: true,
      unlockedAt: '2024-02-20',
      rarity: 'epic' as const
    },
    {
      id: '3',
      name: 'Стратег Dawn of War',
      description: 'Победите в 100 сражениях',
      icon: 'fas fa-chess',
      unlocked: true,
      unlockedAt: '2024-03-10',
      rarity: 'rare' as const
    },
    {
      id: '4',
      name: 'Космический пилот',
      description: 'Исследуйте 50 систем',
      icon: 'fas fa-rocket',
      unlocked: false,
      rarity: 'rare' as const
    },
    {
      id: '5',
      name: 'Торговец',
      description: 'Заработайте 1,000,000 кредитов',
      icon: 'fas fa-coins',
      unlocked: false,
      rarity: 'common' as const
    }
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
        gameName="Общие достижения"
        isOpen={achievementsModal}
        onClose={() => setAchievementsModal(false)}
        achievements={mockAchievements}
      />
    </>
  );
}
