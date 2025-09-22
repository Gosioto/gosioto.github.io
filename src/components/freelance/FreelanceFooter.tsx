// src/components/freelance/FreelanceFooter.tsx
'use client';

import { useState, useEffect } from 'react';

export default function FreelanceFooter() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'Доброй ночи!';
    if (hour < 12) return 'Доброе утро!';
    if (hour < 18) return 'Добрый день!';
    return 'Добрый вечер!';
  };

  return (
    <footer className="freelance-footer">
      <div className="freelance-footer-content">
        
        {/* Live Status */}
        <div className="footer-status">
          <div className="status-indicator">
            <div className="status-pulse"></div>
            <span className="status-text">Онлайн</span>
          </div>
          
          <div className="time-info">
            <span className="greeting">{getGreeting()}</span>
            <span className="current-time">
              <i className="fas fa-clock"></i>
              {formatTime(currentTime)} MSK
            </span>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="footer-interactive">
          <div className="typing-indicator">
            <span className="typing-text">Готов к новым проектам</span>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="footer-links">
          <a href="/" className="footer-link">
            <i className="fas fa-home"></i>
            <span>Главная</span>
          </a>
          <a href="/hobbies" className="footer-link">
            <i className="fas fa-gamepad"></i>
            <span>Хобби</span>
          </a>
          <a href="/projects" className="footer-link">
            <i className="fas fa-folder"></i>
            <span>Проекты</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>&copy; 2025 Gosloto. Сделано за 6 часов с ❤️</p>
          <div className="footer-tech">
            <span>Powered by</span>
            <span className="tech-stack">React • Next.js • TypeScript</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
