// src/components/games/GameScreenshotsModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface GameScreenshotsModalProps {
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
  screenshots: string[];
}

export default function GameScreenshotsModal({ gameName, isOpen, onClose, screenshots: propScreenshots }: GameScreenshotsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const screenshots = propScreenshots.map((src, index) => ({
    src,
    title: `${gameName} - Скриншот ${index + 1}`,
    game: gameName
  }));

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
    <div className="games-modal" onClick={onClose}>
      <div className="games-modal-content max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <div className="games-modal-header">
          <h2 className="games-modal-title">
            <i className="fas fa-images mr-2"></i>
            {gameName} - Скриншоты
          </h2>
          <button className="games-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="games-modal-body">
          {/* Main Image Display */}
          <div className="relative mb-6">
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
              <img
                src={screenshots[currentIndex].src}
                alt={screenshots[currentIndex].title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                loading="lazy"
              />
              
              {/* Navigation Arrows */}
              {currentIndex > 0 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}
              
              {currentIndex < screenshots.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              )}
            </div>
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
              <h3 className="font-semibold">{screenshots[currentIndex].title}</h3>
              <p className="text-sm opacity-90">{screenshots[currentIndex].game}</p>
            </div>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {screenshots.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Выберите скриншот:</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsLoading(true);
                    setCurrentIndex(index);
                  }}
                  className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                    currentIndex === index
                      ? 'ring-2 ring-blue-500 scale-105'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={screenshot.src}
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

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400">
              <p>Используйте стрелки ← → для навигации или кликните на миниатюры</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = screenshots[currentIndex].src;
                  link.download = `screenshot_${currentIndex + 1}.jpg`;
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
