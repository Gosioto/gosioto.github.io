'use client';

export default function TradedamageFeatures() {
  const features = [
    {
      icon: '🎯',
      title: 'Strategic Trading',
      description: 'Plan your moves carefully. Every trade decision impacts the market and your opponents.',
      color: '#ff6b35'
    },
    {
      icon: '⚡',
      title: 'Real-time Battles',
      description: 'Engage in fast-paced trading duels where split-second decisions determine victory.',
      color: '#4ecdc4'
    },
    {
      icon: '🧠',
      title: 'Psychological Warfare',
      description: 'Use bluffing, deception, and market manipulation to outsmart your opponents.',
      color: '#45b7d1'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Access detailed market data, charts, and indicators to make informed decisions.',
      color: '#96ceb4'
    },
    {
      icon: '🏆',
      title: 'Competitive Rankings',
      description: 'Climb the leaderboards and compete in tournaments for ultimate trading glory.',
      color: '#feca57'
    },
    {
      icon: '🎮',
      title: 'Multiple Game Modes',
      description: 'Choose from various game modes including campaigns, tournaments, and free play.',
      color: '#ff9ff3'
    }
  ];

  return (
    <section className="tradedamage-features" id="features">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">Everything you need to dominate the trading floor</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: feature.color }}>
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="features-cta">
          <h3 className="cta-title">Ready to Start Trading?</h3>
          <p className="cta-description">Join thousands of players in the ultimate trading combat experience</p>
          <div className="cta-buttons">
            <button className="btn-primary">Download Now</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
}
