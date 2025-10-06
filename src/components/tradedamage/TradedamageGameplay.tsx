'use client';

import { useState } from 'react';

export default function TradedamageGameplay() {
  const [activeTab, setActiveTab] = useState('trading');

  const gameplayTabs = [
    {
      id: 'trading',
      title: 'Trading Mechanics',
      icon: '📈',
      content: {
        title: 'Master the Markets',
        description: 'Engage in real-time trading battles with dynamic market conditions. Every trade affects the market, creating a living, breathing economy.',
        features: [
          'Real-time market simulation',
          'Dynamic pricing based on supply and demand',
          'Advanced trading strategies and indicators',
          'Risk management tools and stop-losses',
          'Multi-currency trading pairs'
        ]
      }
    },
    {
      id: 'combat',
      title: 'Trading Combat',
      icon: '⚔️',
      content: {
        title: 'Fight with Strategy',
        description: 'Engage in intense trading duels where market knowledge is your weapon. Outsmart opponents through superior analysis and timing.',
        features: [
          'Head-to-head trading battles',
          'Real-time market manipulation',
          'Psychological warfare tactics',
          'Bluffing and deception mechanics',
          'Tournament-style competitions'
        ]
      }
    },
    {
      id: 'progression',
      title: 'Character Progression',
      icon: '🎯',
      content: {
        title: 'Build Your Legacy',
        description: 'Develop your trading skills and unlock new strategies. Progress through ranks and become the ultimate trading champion.',
        features: [
          'Skill trees for different trading styles',
          'Unlockable trading strategies and tools',
          'Ranking system with seasonal rewards',
          'Achievement system with unique rewards',
          'Customizable trading interface'
        ]
      }
    }
  ];

  return (
    <section className="tradedamage-gameplay" id="gameplay">
      <div className="gameplay-container">
        <div className="section-header">
          <h2 className="section-title">Gameplay</h2>
          <p className="section-subtitle">Experience the thrill of high-stakes trading combat</p>
        </div>

        <div className="gameplay-content">
          <div className="gameplay-tabs">
            {gameplayTabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-title">{tab.title}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {gameplayTabs.map((tab) => (
              <div
                key={tab.id}
                className={`content-panel ${activeTab === tab.id ? 'active' : ''}`}
              >
                <h3 className="content-title">{tab.content.title}</h3>
                <p className="content-description">{tab.content.description}</p>
                
                <ul className="features-list">
                  {tab.content.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
