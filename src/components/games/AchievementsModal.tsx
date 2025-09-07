// src/components/games/AchievementsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { getGameIconColor, getGameInitials } from '@/data/achievementsData';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsModalProps {
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export default function AchievementsModal({ gameName, isOpen, onClose, achievements }: AchievementsModalProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'unlocked'>('unlocked');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredAchievements = achievements
    .filter(achievement => {
      const matchesFilter = filter === 'all' || 
        (filter === 'unlocked' && achievement.unlocked) ||
        (filter === 'locked' && !achievement.unlocked);
      
      const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'unlocked':
          return Number(b.unlocked) - Number(a.unlocked);
        default:
          return 0;
      }
    });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 bg-yellow-100';
      case 'epic': return 'text-purple-500 bg-purple-100';
      case 'rare': return 'text-blue-500 bg-blue-100';
      case 'common': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'fas fa-crown';
      case 'epic': return 'fas fa-gem';
      case 'rare': return 'fas fa-star';
      case 'common': return 'fas fa-circle';
      default: return 'fas fa-circle';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="games-modal" onClick={onClose}>
      <div className="games-modal-content max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="games-modal-header">
          <h2 className="games-modal-title">
            <i className="fas fa-trophy mr-2"></i>
            {gameName} - Достижения
          </h2>
          <button className="games-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="games-modal-body">
          {/* Stats Bar */}
          <div className="games-modal-section">
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{unlockedCount}</div>
                  <div className="text-sm text-gray-400">Разблокировано</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalCount}</div>
                  <div className="text-sm text-gray-400">Всего</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{completionPercentage}%</div>
                  <div className="text-sm text-gray-400">Завершено</div>
                </div>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="games-modal-section">
            <div className="flex flex-wrap gap-4 items-center mb-6">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск достижений..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="all">Все достижения</option>
                <option value="unlocked">Разблокированные</option>
                <option value="locked">Заблокированные</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="unlocked">По статусу</option>
                <option value="name">По названию</option>
                <option value="rarity">По редкости</option>
              </select>
            </div>
          </div>

          {/* Achievements List */}
          <div className="games-modal-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`games-modal-card ${
                    achievement.unlocked
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-gray-600/30 bg-gray-500/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.unlocked ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      <i className={`fas fa-trophy text-white ${achievement.unlocked ? '' : 'opacity-50'}`}></i>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                          {achievement.name}
                        </h3>
                        <span className={`games-modal-achievement-rarity ${achievement.rarity}`}>
                          <i className={`${getRarityIcon(achievement.rarity)} mr-1`}></i>
                          {achievement.rarity}
                        </span>
                      </div>
                      <p className={`text-sm ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-green-400 mt-1">
                          <i className="fas fa-calendar mr-1"></i>
                          Разблокировано: {achievement.unlockedAt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-search text-4xl mb-4"></i>
                <p>Достижения не найдены</p>
                <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
