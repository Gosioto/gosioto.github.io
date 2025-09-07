'use client';

import React, { useState } from 'react';

interface GameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccordionItem {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ isOpen, onClose }) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const accordionItems: AccordionItem[] = [
    {
      id: 'genres',
      title: 'Любимые жанры',
      icon: '🎮',
      content: (
        <div className="games-modal-genres">
          <div className="games-modal-genre-item">
            <div className="games-modal-genre-icon">🎯</div>
            <div className="games-modal-genre-info">
              <h4>RPG</h4>
              <p>Ролевые игры с глубокой прокачкой персонажа</p>
              <div className="games-modal-genre-progress">
                <div className="games-modal-progress-bar" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
          <div className="games-modal-genre-item">
            <div className="games-modal-genre-icon">⚔️</div>
            <div className="games-modal-genre-info">
              <h4>Action</h4>
              <p>Динамичные боевые системы и экшен</p>
              <div className="games-modal-genre-progress">
                <div className="games-modal-progress-bar" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
          <div className="games-modal-genre-item">
            <div className="games-modal-genre-icon">🏗️</div>
            <div className="games-modal-genre-info">
              <h4>Strategy</h4>
              <p>Тактические и стратегические игры</p>
              <div className="games-modal-genre-progress">
                <div className="games-modal-progress-bar" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
          <div className="games-modal-genre-item">
            <div className="games-modal-genre-icon">🚗</div>
            <div className="games-modal-genre-info">
              <h4>Simulation</h4>
              <p>Симуляторы и строительные игры</p>
              <div className="games-modal-genre-progress">
                <div className="games-modal-progress-bar" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'platforms',
      title: 'Платформы',
      icon: '💻',
      content: (
        <div className="games-modal-platforms">
          <div className="games-modal-platform-card">
            <div className="games-modal-platform-icon">🖥️</div>
            <h3>PC</h3>
            <p>Основная платформа для игр</p>
            <div className="games-modal-platform-stats">
              <span>500+ игр</span>
            </div>
          </div>
          <div className="games-modal-platform-card">
            <div className="games-modal-platform-icon">🎮</div>
            <h3>Steam</h3>
            <p>Главная библиотека игр</p>
            <div className="games-modal-platform-stats">
              <span>400+ игр</span>
            </div>
          </div>
          <div className="games-modal-platform-card">
            <div className="games-modal-platform-icon">📱</div>
            <h3>Mobile</h3>
            <p>Мобильные игры и приложения</p>
            <div className="games-modal-platform-stats">
              <span>50+ игр</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'achievements',
      title: 'Достижения',
      icon: '🏆',
      content: (
        <div className="games-modal-achievements">
          <div className="games-modal-achievement">
            <div className="games-modal-achievement-icon">🥇</div>
            <div className="games-modal-achievement-info">
              <h4>Мастер завершения</h4>
              <p>Завершил 50+ игр на 100%</p>
              <div className="games-modal-achievement-date">2024</div>
            </div>
          </div>
          <div className="games-modal-achievement">
            <div className="games-modal-achievement-icon">⏰</div>
            <div className="games-modal-achievement-info">
              <h4>Марафонец</h4>
              <p>Играл более 24 часов подряд</p>
              <div className="games-modal-achievement-date">2023</div>
            </div>
          </div>
          <div className="games-modal-achievement">
            <div className="games-modal-achievement-icon">🎯</div>
            <div className="games-modal-achievement-info">
              <h4>Снайпер</h4>
              <p>Попадание в цель с первого выстрела</p>
              <div className="games-modal-achievement-date">2024</div>
            </div>
          </div>
          <div className="games-modal-achievement">
            <div className="games-modal-achievement-icon">💎</div>
            <div className="games-modal-achievement-info">
              <h4>Коллекционер</h4>
              <p>Собрал все редкие предметы</p>
              <div className="games-modal-achievement-date">2024</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'stats',
      title: 'Статистика',
      icon: '📊',
      content: (
        <div className="games-modal-stats">
          <div className="games-modal-stat-item">
            <div className="games-modal-stat-icon">⏱️</div>
            <div className="games-modal-stat-info">
              <h4>Общее время игры</h4>
              <p>2,500+ часов</p>
            </div>
          </div>
          <div className="games-modal-stat-item">
            <div className="games-modal-stat-icon">🎮</div>
            <div className="games-modal-stat-info">
              <h4>Игр завершено</h4>
              <p>150+ игр</p>
            </div>
          </div>
          <div className="games-modal-stat-item">
            <div className="games-modal-stat-icon">🏆</div>
            <div className="games-modal-stat-info">
              <h4>Достижений получено</h4>
              <p>500+ достижений</p>
            </div>
          </div>
          <div className="games-modal-stat-item">
            <div className="games-modal-stat-icon">⭐</div>
            <div className="games-modal-stat-info">
              <h4>Средний рейтинг игр</h4>
              <p>4.2/5.0</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="games-modal-overlay" onClick={onClose}>
      <div className="games-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="games-modal-header">
          <h2>Детальная информация</h2>
          <button className="games-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="games-modal-content">
          <div className="games-modal-accordion">
            {accordionItems.map((item) => (
              <div key={item.id} className="games-modal-accordion-item">
                <button
                  className={`games-modal-accordion-trigger ${activeAccordion === item.id ? 'active' : ''}`}
                  onClick={() => toggleAccordion(item.id)}
                >
                  <div className="games-modal-accordion-trigger-content">
                    <span className="games-modal-accordion-icon">{item.icon}</span>
                    <span className="games-modal-accordion-title">{item.title}</span>
                  </div>
                  <div className="games-modal-accordion-arrow">
                    <i className={`fas fa-chevron-down ${activeAccordion === item.id ? 'rotated' : ''}`}></i>
                  </div>
                </button>
                <div className={`games-modal-accordion-content ${activeAccordion === item.id ? 'active' : ''}`}>
                  <div className="games-modal-accordion-content-inner">
                    {item.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailsModal;
