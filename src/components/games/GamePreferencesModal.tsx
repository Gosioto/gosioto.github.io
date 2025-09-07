// src/components/games/GamePreferencesModal.tsx
'use client';

import { useState } from 'react';

interface GamePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GamePreferencesModal({ isOpen, onClose }: GamePreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<'genres' | 'platforms' | 'achievements'>('genres');

  if (!isOpen) return null;

  const genres = [
    {
      name: 'MMO, прогрессивные ММО',
      description: 'Большие онлайн-миры с прокачкой и экономикой, где есть контент на года игры (но без ограничений - не как генш,zzz,WW и т.д.)',
      icon: 'fas fa-globe',
      color: 'text-blue-400'
    },
    {
      name: 'Космические тематики и космо-RPG',
      description: 'Игры о космосе и космических путешествиях, использование физики в играх (космической), а так же фантастика - тоже космическая',
      icon: 'fas fa-rocket',
      color: 'text-purple-400'
    },
    {
      name: 'Стратегии (X3 - X4, Dawn of War)',
      description: 'Пошаговые, реального времени и RTS, про космос - других фаворитов не нашел пока',
      icon: 'fas fa-chess',
      color: 'text-green-400'
    },
    {
      name: 'Симуляторы',
      description: 'Вождения - только Saber Interactive, космо, фэнтези, фантастика. Множество ограничений на этот жанр',
      icon: 'fas fa-car',
      color: 'text-orange-400'
    },
    {
      name: 'Сюжетные RPG',
      description: 'Глубокие сюжеты и развитие персонажа, психологические и детективные сюжеты, сюжеты с малой выдачей информации.',
      icon: 'fas fa-book',
      color: 'text-red-400'
    }
  ];

  const platforms = [
    { name: 'PC', icon: 'fas fa-desktop', description: 'Основная платформа для игр' },
    { name: 'Steam', icon: 'fab fa-steam', description: 'Главная библиотека игр' },
    { name: 'Mobile', icon: 'fas fa-mobile-alt', description: 'Мобильные игры' }
  ];

  const achievements = [
    { name: 'Мастер Witcher 3', game: 'The Witcher 3', rarity: 'legendary', icon: '🏆' },
    { name: 'Выживший GTFO', game: 'GTFO', rarity: 'epic', icon: '💀' },
    { name: 'Стратег Dawn of War', game: 'Dawn of War', rarity: 'rare', icon: '⚔️' },
    { name: 'Космический пилот', game: 'EVE Frontier', rarity: 'rare', icon: '🚀' },
    { name: 'Торговец', game: 'Tradesman', rarity: 'common', icon: '💰' }
  ];

  return (
    <div className="games-modal" onClick={onClose}>
      <div className="games-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="games-modal-header">
          <h2 className="games-modal-title">Игровые предпочтения</h2>
          <button className="games-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="games-modal-body">
          {/* Tabs */}
          <div className="games-modal-tabs">
            <button
              onClick={() => setActiveTab('genres')}
              className={`games-modal-tab ${activeTab === 'genres' ? 'active' : ''}`}
            >
              <i className="fas fa-tags"></i>
              Жанры
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`games-modal-tab ${activeTab === 'platforms' ? 'active' : ''}`}
            >
              <i className="fas fa-desktop"></i>
              Платформы
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`games-modal-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            >
              <i className="fas fa-trophy"></i>
              Достижения
            </button>
          </div>

          {/* Content */}
          {activeTab === 'genres' && (
            <div className="games-modal-section">
              <h3>Любимые жанры</h3>
              {genres.map((genre, index) => (
                <div key={index} className="games-modal-card">
                  <div className="games-modal-card-header">
                    <div className="games-modal-card-icon">
                      <i className={genre.icon}></i>
                    </div>
                    <div>
                      <h4 className="games-modal-card-title">{genre.name}</h4>
                      <p className="games-modal-card-description">{genre.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'platforms' && (
            <div className="games-modal-section">
              <h3>Игровые платформы</h3>
              <div className="games-modal-platforms">
                {platforms.map((platform, index) => (
                  <div key={index} className="games-modal-platform-card">
                    <div className="games-modal-platform-icon">
                      <i className={platform.icon}></i>
                    </div>
                    <h4 className="games-modal-platform-name">{platform.name}</h4>
                    <p className="games-modal-platform-description">{platform.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="games-modal-section">
              <h3>Значимые достижения</h3>
              {achievements.map((achievement, index) => (
                <div key={index} className="games-modal-achievement">
                  <div className="games-modal-achievement-icon">{achievement.icon}</div>
                  <div className="games-modal-achievement-info">
                    <h4 className="games-modal-achievement-name">{achievement.name}</h4>
                    <p className="games-modal-achievement-game">Игра: {achievement.game}</p>
                  </div>
                  <span className={`games-modal-achievement-rarity ${achievement.rarity}`}>
                    {achievement.rarity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
