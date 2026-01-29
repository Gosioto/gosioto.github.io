// src/components/freelance/FreelanceHeader.tsx
'use client';

import { useState } from 'react';

export default function FreelanceHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="freelance-header">
      <div className="freelance-header-content">
        
        {/* Logo */}
        <div className="freelance-header-brand">
          <a href="/" className="freelance-header-logo">
            <i className="fas fa-code"></i>
            <span>Freelance</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="freelance-header-nav">
          <a href="/" className="nav-link">Главная</a>
          <a href="#services" className="nav-link">Что умею</a>
          <a href="#skills" className="nav-link">Технологии</a>
          <a href="#projects" className="nav-link">Портфолио</a>
          <a href="#contacts" className="nav-link">Связаться</a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={`freelance-header-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Открыть меню"
        >
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="freelance-header-mobile-menu">
            <a href="/" className="mobile-nav-link">Главная</a>
            <a href="#services" className="mobile-nav-link">Что умею</a>
            <a href="#skills" className="mobile-nav-link">Технологии</a>
            <a href="#projects" className="mobile-nav-link">Портфолио</a>
            <a href="#contacts" className="mobile-nav-link">Связаться</a>
          </div>
        )}

      </div>
    </header>
  );
}
