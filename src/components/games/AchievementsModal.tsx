// src/components/games/AchievementsModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  game: string;
  gameId: string;
  description: string;
  date: string;
  timestamp: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for achievements
const achievementsData: Achievement[] = [
  {
    id: '1',
    title: 'Мастер Ведьмака',
    game: 'The Witcher 3: Wild Hunt',
    gameId: 'witcher3',
    description: 'Прошел игру на максимальной сложности',
    date: '2023-12-15',
    timestamp: 1702598400000,
    icon: 'fas fa-crown',
    rarity: 'legendary'
  },
  {
    id: '2',
    title: 'Выживший',
    game: 'GTFO',
    gameId: 'gtfo',
    description: 'Выжил в самых сложных рейдах',
    date: '2023-11-20',
    timestamp: 1700438400000,
    icon: 'fas fa-shield-alt',
    rarity: 'epic'
  },
  {
    id: '3',
    title: 'Стратег',
    game: 'Dawn of War III',
    gameId: 'dow3',
    description: 'Победил в 100 сражениях',
    date: '2023-10-10',
    timestamp: 1696896000000,
    icon: 'fas fa-chess',
    rarity: 'rare'
  },
  {
    id: '4',
    title: 'Космический пилот',
    game: 'EVE Online',
    gameId: 'eve',
    description: 'Накопил 1 миллион ISK',
    date: '2023-09-05',
    timestamp: 1693843200000,
    icon: 'fas fa-rocket',
    rarity: 'common'
  },
  {
    id: '5',
    title: 'Строитель',
    game: 'Factorio',
    gameId: 'factorio',
    description: 'Построил автоматизированную фабрику',
    date: '2023-08-15',
    timestamp: 1692057600000,
    icon: 'fas fa-cogs',
    rarity: 'rare'
  }
];

const getUniqueGames = () => {
  const games = achievementsData.map(achievement => ({
    id: achievement.gameId,
    name: achievement.game
  }));
  return games.filter((game, index, self) => 
    index === self.findIndex(g => g.id === game.id)
  );
};

export default function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>(achievementsData);

  const games = getUniqueGames();

  // Обновляем фильтрованные достижения при изменении фильтров
  useEffect(() => {
    let filtered = achievementsData;
    
    // Фильтр по игре
    if (selectedGame) {
      filtered = filtered.filter(achievement => achievement.gameId === selectedGame);
    }
    
    // Сортировка по дате
    filtered = filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.timestamp - a.timestamp; // Новые сначала
      } else {
        return a.timestamp - b.timestamp; // Старые сначала
      }
    });
    
    setFilteredAchievements(filtered);
  }, [selectedGame, sortOrder]);

  // Обработка клавиш и блокировка скролла
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Обычное';
      case 'rare': return 'Редкое';
      case 'epic': return 'Эпическое';
      case 'legendary': return 'Легендарное';
      default: return 'Обычное';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="achievements-modal-overlay">
      <div className="achievements-modal">
        {/* Header */}
        <div className="achievements-header">
          <h2 className="achievements-title">
            <i className="fas fa-trophy"></i>
            Достижения и челенджи
          </h2>
          <button 
            className="achievements-close-btn"
            onClick={onClose}
            title="Закрыть"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Filters */}
        <div className="achievements-filters">
          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-gamepad"></i>
              Игра:
            </label>
            <select 
              className="filter-select"
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
            >
              <option value="">Все игры</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-sort"></i>
              Сортировка:
            </label>
            <select 
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
          </div>

          <button 
            className="filter-clear-btn"
            onClick={() => {
              setSelectedGame('');
              setSortOrder('newest');
            }}
          >
            <i className="fas fa-times"></i>
            Очистить
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="achievements-content">
          <div className="achievements-stats">
            <span className="stats-text">
              Показано: {filteredAchievements.length} из {achievementsData.length} достижений
            </span>
          </div>
          
          <div className="achievements-grid">
            {filteredAchievements.length > 0 ? (
              filteredAchievements.map(achievement => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-icon" style={{ color: getRarityColor(achievement.rarity) }}>
                    <i className={achievement.icon}></i>
                  </div>
                  <div className="achievement-info">
                    <h3 className="achievement-title">{achievement.title}</h3>
                    <p className="achievement-game">{achievement.game}</p>
                    <p className="achievement-description">{achievement.description}</p>
                    <div className="achievement-meta">
                      <span className="achievement-date">{formatDate(achievement.timestamp)}</span>
                      <span 
                        className="achievement-rarity"
                        style={{ color: getRarityColor(achievement.rarity) }}
                      >
                        {getRarityText(achievement.rarity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="achievements-empty">
                <i className="fas fa-search"></i>
                <p>Достижения не найдены</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}