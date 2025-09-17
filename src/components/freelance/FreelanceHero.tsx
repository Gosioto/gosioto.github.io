// src/components/freelance/FreelanceHero.tsx
'use client';

export default function FreelanceHero() {
  return (
    <section className="freelance-hero" id="hero">
      <div className="freelance-hero-content">
        
        {/* Profile Section */}
        <div className="freelance-profile">
          <div className="freelance-profile-image">
            <img 
              src="/img/Gosloto.png" 
              alt="Gosloto Avatar" 
              className="profile-avatar"
            />
            <div className="profile-status">
              <span className="status-dot"></span>
              <span className="status-text">Доступен для работы</span>
            </div>
          </div>
          
          <div className="freelance-profile-info">
            <div className="freelance-name-container">
              <h1 className="freelance-name">Gosloto</h1>
              <div className="freelance-time-status">
                <span className="current-time-msk">МСК</span>
                <span className="response-time">Отвечаю за 5-7 мин</span>
              </div>
            </div>
            <p className="freelance-real-name">Иван</p>
            <p className="freelance-title">Full-Stack Developer & UI/UX Designer</p>
            <p className="freelance-subtitle">Создаю цифровые решения, которые работают</p>
            
            <div className="freelance-stats">
              <div className="stat-item">
                <span className="stat-number">5+</span>
                <span className="stat-label">лет опыта</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">проектов</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">довольных клиентов</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="freelance-quick-actions">
          <a href="#contacts" className="action-btn primary">
            <i className="fas fa-paper-plane"></i>
            <span>Написать мне</span>
          </a>
          <a href="#projects" className="action-btn secondary">
            <i className="fas fa-eye"></i>
            <span>Посмотреть работы</span>
          </a>
        </div>

      </div>
    </section>
  );
}
