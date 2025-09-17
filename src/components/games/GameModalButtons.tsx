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
      title: 'Мастер Witcher 3',
      game: 'The Witcher 3: Wild Hunt',
      gameId: 'witcher3',
      description: 'Завершите все основные квесты',
      date: '15 янв. 2024',
      timestamp: 1705276800000,
      icon: 'fas fa-crown',
      rarity: 'legendary' as const
    },
    {
      id: '2',
      title: 'Выживший GTFO',
      game: 'GTFO',
      gameId: 'gtfo',
      description: 'Пройдите все уровни сложности',
      date: '20 фев. 2024',
      timestamp: 1708387200000,
      icon: 'fas fa-skull',
      rarity: 'epic' as const
    },
    {
      id: '3',
      title: 'Стратег Dawn of War',
      game: 'Dawn of War Soulstorm',
      gameId: 'soulstorm',
      description: 'Победите в 100 сражениях',
      date: '10 мар. 2024',
      timestamp: 1710115200000,
      icon: 'fas fa-chess',
      rarity: 'rare' as const
    },
    {
      id: '4',
      title: 'Космический пилот',
      game: 'EVE Frontier',
      gameId: 'eve',
      description: 'Исследуйте 50 систем',
      date: 'В процессе',
      timestamp: 0,
      icon: 'fas fa-rocket',
      rarity: 'rare' as const
    },
    {
      id: '5',
      title: 'Торговец',
      game: 'Tradesman Deal to Dealer',
      gameId: 'tradesman',
      description: 'Заработайте 1,000,000 кредитов',
      date: 'В процессе',
      timestamp: 0,
      icon: 'fas fa-coins',
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
