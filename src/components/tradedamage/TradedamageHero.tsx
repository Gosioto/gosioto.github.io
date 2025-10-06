'use client';

import { useState, useEffect } from 'react';

export default function TradedamageHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Deal to Die",
      subtitle: "Trade your way to victory or perish trying",
      description: "A strategic trading game where every deal could be your last. Master the markets, outsmart your opponents, and survive the ultimate trading challenge.",
      bgImage: "/img/tradedamage-hero-1.jpg"
    },
    {
      title: "Strategic Combat",
      subtitle: "Fight with your wits, not your weapons",
      description: "Engage in intense trading battles where market knowledge is your greatest weapon. Every decision matters in this high-stakes trading arena.",
      bgImage: "/img/tradedamage-hero-2.jpg"
    },
    {
      title: "Market Mastery",
      subtitle: "Dominate the trading floor",
      description: "Build your trading empire from the ground up. Learn advanced strategies, manage risks, and become the ultimate trading champion.",
      bgImage: "/img/tradedamage-hero-3.jpg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <section className="tradedamage-hero">
      <div className="hero-slider">
        {heroSlides.map((slide, index) => (
          <div 
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          >
            <div className="hero-overlay">
              <div className="hero-content">
                <h1 className="hero-title">{slide.title}</h1>
                <h2 className="hero-subtitle">{slide.subtitle}</h2>
                <p className="hero-description">{slide.description}</p>
                
                <div className="hero-actions">
                  <button className="btn-play">Start Trading</button>
                  <button className="btn-watch">Watch Trailer</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-indicators">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
