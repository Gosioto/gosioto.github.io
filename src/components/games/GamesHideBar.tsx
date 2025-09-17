// src/components/games/GamesHideBar.tsx
'use client';

import { useState, useEffect } from 'react';

interface GamesHideBarProps {
  onOpenGallery: () => void;
  onOpenAchievements: () => void;
  isMenuOpen: boolean;
  onCloseMenu: () => void;
}

export default function GamesHideBar({ onOpenGallery, onOpenAchievements, isMenuOpen, onCloseMenu }: GamesHideBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Don't show on mobile via mouse

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
  }, [isMobile]);

  return (
    <div 
      className={`games-hide-bar ${isMobile ? (isMenuOpen ? 'visible mobile' : 'mobile') : (isVisible || isHovered ? 'visible' : '')}`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="hide-bar-content">
        {/* Жанры */}
        <div className="hide-bar-section hide-bar-genres">
          <div className="section-header">
            <h3 className="section-title">
              <i className="fas fa-tags"></i>
              Жанры
            </h3>
          </div>
          <div className="section-items">
            <span className="genre-badge-mini" title="Большие онлайн-миры с прокачкой и экономикой">
              MMO
            </span>
            <span className="genre-badge-mini" title="Игры о космосе и космических путешествиях">
              Космос
            </span>
            <span className="genre-badge-mini" title="Пошаговые и RTS стратегии">
              Стратегии
            </span>
            <span className="genre-badge-mini" title="Симуляторы вождения и космоса">
              Симуляторы
            </span>
            <span className="genre-badge-mini" title="Глубокие сюжетные RPG">
              RPG
            </span>
          </div>
        </div>

        {/* Платформы */}
        <div className="hide-bar-section hide-bar-platforms">
          <div className="section-header">
            <h3 className="section-title">
              <i className="fas fa-desktop"></i>
              Платформы
            </h3>
          </div>
          <div className="section-items">
            <span className="platform-badge-mini">
              <i className="fas fa-desktop"></i>
              PC
            </span>
            <span className="platform-badge-mini">
              <i className="fab fa-steam"></i>
              Steam
            </span>
            <span className="platform-badge-mini">
              <i className="fas fa-mobile-alt"></i>
              Mobile
            </span>
          </div>
        </div>

        {/* Контакты */}
        <div className="hide-bar-section hide-bar-contacts">
          <div className="section-header">
            <h3 className="section-title">
              <i className="fas fa-user"></i>
              Контакты
            </h3>
          </div>
          <div className="section-items">
            <a 
              href="https://steamcommunity.com/id/Gosloto/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link-mini"
              title="Steam - Gosloto"
            >
              <i className="fab fa-steam"></i>
              Steam
            </a>
            <a 
              href="https://discord.gg/gosloto" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link-mini"
              title="Discord: gosloto"
            >
              <i className="fab fa-discord"></i>
              Discord
            </a>
          </div>
        </div>

        {/* Достижения */}
        <div className="hide-bar-section hide-bar-achievements">
          <div className="section-header">
            <h3 className="section-title">
              <i className="fas fa-trophy"></i>
              Достижения и челенджи
            </h3>
          </div>
          <button 
            className="achievements-btn-mini"
            onClick={onOpenAchievements}
            title="Открыть все достижения"
          >
            <i className="fas fa-medal"></i>
            <span>Все достижения</span>
          </button>
        </div>

        {/* Галерея моментов */}
        <div className="hide-bar-section hide-bar-gallery">
          <div className="section-header">
            <h3 className="section-title">
              <i className="fas fa-camera"></i>
              Галерея моментов
            </h3>
          </div>
          <button 
            className="gallery-btn-mini"
            onClick={onOpenGallery}
            title="Открыть галерею скриншотов"
          >
            <i className="fas fa-images"></i>
            <span>Скриншоты</span>
          </button>
        </div>
      </div>
    </div>
  );
}
