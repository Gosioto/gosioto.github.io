// src/components/games/GamesHeader.tsx
'use client';

import { useState } from 'react';

interface GamesHeaderProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  onBackToHobbies: () => void;
}

export default function GamesHeader({ onOpenMenu, isMenuOpen, onBackToHobbies }: GamesHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <header className="games-header">
      <div className="games-header-content">
        
        {/* Logo and Title */}
        <div className="games-header-brand">
          <div className="games-header-logo">
            <i className="fas fa-gamepad"></i>
          </div>
          <div className="games-header-title">
            <h1>Игровая Вселенная</h1>
            <a href="/" className="games-header-home-link">
              Портфолио разработчика
            </a>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="games-header-nav desktop-nav">
          <a href="#stats" className="nav-link">
            <i className="fas fa-chart-bar"></i>
            <span>Статистика</span>
          </a>
          <a href="#top-games" className="nav-link">
            <i className="fas fa-trophy"></i>
            <span>Топ игр</span>
          </a>
          <a href="#current" className="nav-link">
            <i className="fas fa-play"></i>
            <span>Сейчас играю</span>
          </a>
          <a href="#steam" className="nav-link">
            <i className="fab fa-steam"></i>
            <span>Steam</span>
          </a>
        </nav>

        {/* Right Side - Back Button and Mobile Menu */}
        <div className="games-header-right">
          {/* Back Button */}
          <button 
            className="games-header-back-btn"
            onClick={onBackToHobbies}
            title="Назад в хобби"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Назад в хобби</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            className={`games-header-menu-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={onOpenMenu}
            aria-label="Открыть меню"
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>

      </div>
    </header>
  );
}
