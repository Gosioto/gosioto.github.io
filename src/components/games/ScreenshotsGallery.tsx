// src/components/games/ScreenshotsGallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { screenshotsData, getUniqueGames, filterScreenshots, Screenshot } from '@/data/screenshotsData';

interface ScreenshotsGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScreenshotsGallery({ isOpen, onClose }: ScreenshotsGalleryProps) {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filteredScreenshots, setFilteredScreenshots] = useState<Screenshot[]>(screenshotsData);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const games = getUniqueGames();

  // Обновляем фильтрованные скриншоты при изменении фильтров
  useEffect(() => {
    let filtered = screenshotsData;
    
    // Фильтр по игре
    if (selectedGame) {
      filtered = filtered.filter(screenshot => screenshot.gameId === selectedGame);
    }
    
    // Сортировка по дате
    filtered = filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.timestamp - a.timestamp; // Новые сначала
      } else {
        return a.timestamp - b.timestamp; // Старые сначала
      }
    });
    
    setFilteredScreenshots(filtered);
  }, [selectedGame, sortOrder]);

  // Обработка клавиш и блокировка скролла
  useEffect(() => {
    if (!isOpen) return;

    // Блокируем скролл body
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedScreenshot) {
          setSelectedScreenshot(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && selectedScreenshot) {
        navigateScreenshot(-1);
      } else if (e.key === 'ArrowRight' && selectedScreenshot) {
        navigateScreenshot(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Восстанавливаем скролл body
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedScreenshot]);

  const navigateScreenshot = (direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < filteredScreenshots.length) {
      setCurrentIndex(newIndex);
      setSelectedScreenshot(filteredScreenshots[newIndex]);
    }
  };

  const openScreenshot = (screenshot: Screenshot) => {
    const index = filteredScreenshots.findIndex(s => s.id === screenshot.id);
    setCurrentIndex(index);
    setSelectedScreenshot(screenshot);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="screenshots-gallery-overlay">
      <div className="screenshots-gallery-modal">
        {/* Header */}
        <div className="gallery-header">
          <h2 className="gallery-title">
            <i className="fas fa-images"></i>
            Галерея скриншотов
          </h2>
          <button 
            className="gallery-close-btn"
            onClick={onClose}
            aria-label="Закрыть галерею"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Filters */}
        <div className="gallery-filters">
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

        {/* Screenshots Grid */}
        <div className="gallery-content">
          <div className="gallery-stats">
            <span className="stats-text">
              Показано {filteredScreenshots.length} из {screenshotsData.length} скриншотов
            </span>
          </div>

          <div className="screenshots-grid">
            {filteredScreenshots.map((screenshot) => (
              <div 
                key={screenshot.id}
                className="screenshot-item"
                onClick={() => openScreenshot(screenshot)}
              >
                <div className="screenshot-thumbnail">
                  <img 
                    src={screenshot.thumbnail}
                    alt={`${screenshot.game} - ${screenshot.filename}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/img/screenshot/screenshot1.jpg';
                    }}
                  />
                  <div className="screenshot-overlay">
                    <i className="fas fa-expand"></i>
                  </div>
                </div>
                <div className="screenshot-info">
                  <div className="screenshot-game">{screenshot.game}</div>
                  <div className="screenshot-date">{formatDate(screenshot.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>

          {filteredScreenshots.length === 0 && (
            <div className="gallery-empty">
              <i className="fas fa-images"></i>
              <h3>Скриншоты не найдены</h3>
              <p>Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Viewer */}
      {selectedScreenshot && (
        <div className="screenshot-viewer">
          <div className="viewer-header">
            <div className="viewer-info">
              <h3>{selectedScreenshot.game}</h3>
              <span>{formatDate(selectedScreenshot.timestamp)}</span>
            </div>
            <div className="viewer-nav">
              <button 
                className="nav-btn"
                onClick={() => navigateScreenshot(-1)}
                disabled={currentIndex === 0}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="nav-counter">
                {currentIndex + 1} / {filteredScreenshots.length}
              </span>
              <button 
                className="nav-btn"
                onClick={() => navigateScreenshot(1)}
                disabled={currentIndex === filteredScreenshots.length - 1}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <button 
              className="viewer-close-btn"
              onClick={() => setSelectedScreenshot(null)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="viewer-image">
            <img 
              src={selectedScreenshot.path}
              alt={`${selectedScreenshot.game} - ${selectedScreenshot.filename}`}
              onError={(e) => {
                e.currentTarget.src = '/img/screenshot/screenshot1.jpg';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
