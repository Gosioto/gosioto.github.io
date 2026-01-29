// src/components/games/ScreenshotsModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface ScreenshotsModalProps {
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
  screenshots: string[];
}

export default function ScreenshotsModal({ gameName, isOpen, onClose, screenshots }: ScreenshotsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentIndex(0);
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
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const goToNext = () => {
    if (currentIndex < screenshots.length - 1) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsLoading(false);
      }, 150);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsLoading(false);
      }, 150);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!isOpen || !screenshots.length) return null;

  return (
    <div
      className="screenshots-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Скриншоты: ${gameName}`}
    >
      <div
        className="screenshots-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="screenshots-modal-header">
          <h2 className="screenshots-modal-title">
            <i className="fas fa-images"></i>
            {gameName} — Скриншоты
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="screenshots-modal-close"
            aria-label="Закрыть"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Main Content */}
        <div className="screenshots-modal-body">
          <div className="screenshots-main">
            <div className="screenshots-image-container">
              {isLoading && (
                <div className="screenshots-loading">
                  <div className="screenshots-spinner"></div>
                </div>
              )}
              <img
                src={screenshots[currentIndex]}
                alt={`${gameName} скриншот ${currentIndex + 1}`}
                className={`screenshots-main-img ${isLoading ? 'is-loading' : ''}`}
                onLoad={handleImageLoad}
                loading="lazy"
              />
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="screenshots-nav screenshots-nav-prev"
                  aria-label="Предыдущий"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}
              {currentIndex < screenshots.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="screenshots-nav screenshots-nav-next"
                  aria-label="Следующий"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              )}
            </div>
            <div className="screenshots-counter">
              {currentIndex + 1} / {screenshots.length}
            </div>
          </div>

          {screenshots.length > 1 && (
            <div className="screenshots-thumbnails">
              <h3 className="screenshots-thumbnails-title">Выберите скриншот:</h3>
              <div className="screenshots-thumbnail-grid">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setCurrentIndex(index);
                    }}
                    className={`screenshots-thumbnail ${currentIndex === index ? 'is-active' : ''}`}
                  >
                    <img src={screenshot} alt={`Миниатюра ${index + 1}`} loading="lazy" />
                    {currentIndex === index && (
                      <span className="screenshots-thumbnail-check"><i className="fas fa-check"></i></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="screenshots-controls">
            <p className="screenshots-info">Стрелки ← → или клик по миниатюрам</p>
            <div className="screenshots-actions">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = screenshots[currentIndex];
                  link.download = `${gameName}_screenshot_${currentIndex + 1}.jpg`;
                  link.click();
                }}
                className="screenshots-btn screenshots-btn-download"
              >
                <i className="fas fa-download"></i> Скачать
              </button>
              <button type="button" onClick={onClose} className="screenshots-btn screenshots-btn-close">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
