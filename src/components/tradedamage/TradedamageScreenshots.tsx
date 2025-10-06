'use client';

import { useState } from 'react';

export default function TradedamageScreenshots() {
  const [activeImage, setActiveImage] = useState(0);

  const screenshots = [
    {
      src: '/img/tradedamage-screenshot-1.jpg',
      alt: 'Trading Interface',
      title: 'Advanced Trading Interface',
      description: 'Clean, intuitive interface designed for fast decision-making'
    },
    {
      src: '/img/tradedamage-screenshot-2.jpg',
      alt: 'Market Analysis',
      title: 'Real-time Market Analysis',
      description: 'Comprehensive charts and indicators for market analysis'
    },
    {
      src: '/img/tradedamage-screenshot-3.jpg',
      alt: 'Trading Battle',
      title: 'Intense Trading Battles',
      description: 'Face off against other traders in high-stakes duels'
    },
    {
      src: '/img/tradedamage-screenshot-4.jpg',
      alt: 'Portfolio Management',
      title: 'Portfolio Management',
      description: 'Track your performance and manage your trading portfolio'
    },
    {
      src: '/img/tradedamage-screenshot-5.jpg',
      alt: 'Tournament Mode',
      title: 'Tournament Competitions',
      description: 'Compete in tournaments for prizes and recognition'
    }
  ];

  return (
    <section className="tradedamage-screenshots" id="screenshots">
      <div className="screenshots-container">
        <div className="section-header">
          <h2 className="section-title">Screenshots</h2>
          <p className="section-subtitle">See the game in action</p>
        </div>

        <div className="screenshots-content">
          <div className="main-screenshot">
            <img
              src={screenshots[activeImage].src}
              alt={screenshots[activeImage].alt}
              className="screenshot-image"
            />
            <div className="screenshot-overlay">
              <h3 className="screenshot-title">{screenshots[activeImage].title}</h3>
              <p className="screenshot-description">{screenshots[activeImage].description}</p>
            </div>
          </div>

          <div className="screenshot-thumbnails">
            {screenshots.map((screenshot, index) => (
              <button
                key={index}
                className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  className="thumbnail-image"
                />
                <div className="thumbnail-overlay">
                  <span className="thumbnail-title">{screenshot.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="screenshot-navigation">
          <button
            className="nav-button prev"
            onClick={() => setActiveImage((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
          >
            ← Previous
          </button>
          <span className="image-counter">
            {activeImage + 1} / {screenshots.length}
          </span>
          <button
            className="nav-button next"
            onClick={() => setActiveImage((prev) => (prev + 1) % screenshots.length)}
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
