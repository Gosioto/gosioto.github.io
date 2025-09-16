// src/components/games/GamesHideBar.tsx
'use client';

import { useState, useEffect } from 'react';

export default function GamesHideBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const mouseY = e.clientY;
      
      // Показываем хайд-бар когда мышь в нижних 100px экрана
      if (mouseY > windowHeight - 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={`games-hide-bar ${isVisible || isHovered ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="hide-bar-content">
        {/* Жанры */}
        <div className="hide-bar-section">
          <h3 className="hide-bar-title">
            <i className="fas fa-tags"></i>
            Жанры
          </h3>
          <div className="hide-bar-items">
            <span className="hide-bar-item" title="Большие онлайн-миры с прокачкой и экономикой">
              MMO
            </span>
            <span className="hide-bar-item" title="Игры о космосе и космических путешествиях">
              Космос
            </span>
            <span className="hide-bar-item" title="Пошаговые и RTS стратегии">
              Стратегии
            </span>
            <span className="hide-bar-item" title="Симуляторы вождения и космоса">
              Симуляторы
            </span>
            <span className="hide-bar-item" title="Глубокие сюжетные RPG">
              RPG
            </span>
          </div>
        </div>

        {/* Платформы */}
        <div className="hide-bar-section">
          <h3 className="hide-bar-title">
            <i className="fas fa-desktop"></i>
            Платформы
          </h3>
          <div className="hide-bar-platforms">
            <span className="platform-badge">
              <i className="fas fa-desktop"></i>
              PC
            </span>
            <span className="platform-badge">
              <i className="fab fa-steam"></i>
              Steam
            </span>
            <span className="platform-badge">
              <i className="fas fa-mobile-alt"></i>
              Mobile
            </span>
          </div>
        </div>

        {/* Достижения */}
        <div className="hide-bar-section">
          <h3 className="hide-bar-title">
            <i className="fas fa-trophy"></i>
            Достижения
          </h3>
          <div className="hide-bar-achievements">
            <span className="achievement-item">
              <i className="fas fa-crown text-yellow-400"></i>
              Мастер Witcher 3
            </span>
            <span className="achievement-item">
              <i className="fas fa-shield-alt text-blue-400"></i>
              Выживший GTFO
            </span>
            <span className="achievement-item">
              <i className="fas fa-chess text-purple-400"></i>
              Стратег Dawn of War
            </span>
          </div>
        </div>

        {/* Контакты */}
        <div className="hide-bar-section">
          <h3 className="hide-bar-title">
            <i className="fas fa-user"></i>
            Контакты
          </h3>
          <div className="hide-bar-contacts">
            <a 
              href="https://steamcommunity.com/id/Gosloto/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
              title="Steam - Gosloto"
            >
              <i className="fab fa-steam"></i>
              Steam
            </a>
            <a 
              href="https://discord.gg/gosloto" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
              title="Discord: gosloto"
            >
              <i className="fab fa-discord"></i>
              Discord
            </a>
          </div>
        </div>

        {/* Скриншоты */}
        <div className="hide-bar-section">
          <h3 className="hide-bar-title">
            <i className="fas fa-images"></i>
            Скриншоты
          </h3>
          <div className="hide-bar-screenshots">
            <img 
              src="/img/screenshot/screenshot1.jpg" 
              alt="Скриншот 1" 
              className="screenshot-thumb"
              loading="lazy"
            />
            <img 
              src="/img/screenshot/screenshot2.jpg" 
              alt="Скриншот 2" 
              className="screenshot-thumb"
              loading="lazy"
            />
            <img 
              src="/img/screenshot/screenshot3.jpg" 
              alt="Скриншот 3" 
              className="screenshot-thumb"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
