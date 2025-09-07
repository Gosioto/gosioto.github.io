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

  if (!isOpen) return null;

  return (
    <div className="screenshots-modal fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="screenshots-modal-content bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="screenshots-modal-header bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-images"></i>
            {gameName} - Скриншоты
          </h2>
          <button
            onClick={onClose}
            className="screenshots-modal-close w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Main Content */}
        <div className="screenshots-modal-body p-6">
          {/* Image Display */}
          <div className="screenshots-main relative mb-4">
            <div className="screenshots-image-container relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
              <img
                src={screenshots[currentIndex]}
                alt={`${gameName} скриншот ${currentIndex + 1}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                loading="lazy"
              />
              
              {/* Navigation Arrows */}
              {currentIndex > 0 && (
                <button
                  onClick={goToPrevious}
                  className="screenshots-nav screenshots-nav-prev absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}
              
              {currentIndex < screenshots.length - 1 && (
                <button
                  onClick={goToNext}
                  className="screenshots-nav screenshots-nav-next absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              )}
            </div>
            
            {/* Image Counter */}
            <div className="screenshots-counter absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {screenshots.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {screenshots.length > 1 && (
            <div className="screenshots-thumbnails">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Выберите скриншот:</h3>
              <div className="screenshots-thumbnail-grid grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsLoading(true);
                      setCurrentIndex(index);
                    }}
                    className={`screenshots-thumbnail relative aspect-video rounded-lg overflow-hidden transition-all ${
                      currentIndex === index
                        ? 'ring-2 ring-blue-500 scale-105'
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={screenshot}
                      alt={`Миниатюра ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {currentIndex === index && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <i className="fas fa-check text-white text-sm"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="screenshots-controls flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="screenshots-info text-sm text-gray-600">
              <p>Используйте стрелки ← → для навигации или кликните на миниатюры</p>
            </div>
            <div className="screenshots-actions flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = screenshots[currentIndex];
                  link.download = `${gameName}_screenshot_${currentIndex + 1}.jpg`;
                  link.click();
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <i className="fas fa-download"></i>
                Скачать
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
