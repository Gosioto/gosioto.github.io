// src/components/freelance/FreelanceProjects.tsx
'use client';

export default function FreelanceProjects() {
  const featuredProjects = [
    {
      title: 'SKYT - Трекер времени',
      description: 'Программа для контроля своего времени с интуитивным интерфейсом и подробной статистикой',
      tech: ['JavaScript', 'Vue.js', 'Node.js', 'PostgreSQL'],
      image: '/img/skyt.png',
      link: '/SKYT/index.html',
      theme: 'skyt'
    },
    {
      title: 'SentinelGuard - Сетевой администратор',
      description: 'Администратор сети, разработанный на Python и NMap для мониторинга сетевой безопасности',
      tech: ['Python', 'NMap', 'Network Security', 'Bash'],
      image: '/img/shield-icon.png',
      link: '/sentinelguard/index.html',
      theme: 'sentinel'
    },
    {
      title: 'мини игра "пиксельная экосистема"',
      description: 'Полный рефакторинг игры с React на Vanilla JS. Уменьшение размера бандла на 85%',
      tech: ['JavaScript ES6+', 'Canvas 2D API', 'Web Workers', 'CSS Custom Properties'],
      image: '/img/pixel.png',
      link: '/#pixel-ecosystem-game',
      theme: 'pixel'
    },
    {
      title: 'Ruin XXI',
      description: 'Веб-игра в жанре стратегии/RPG: почта, чат, друзья, профиль. Проект в разработке — лендинг и базовая инфраструктура на месте.',
      tech: ['JavaScript', 'TypeScript', 'Node.js', 'Чат', 'Профили'],
      image: '/img/game.png',
      link: 'https://ruinxxi.ru/',
      comingSoon: true,
      theme: 'ruinxxi'
    },
    {
      title: 'ACHERON',
      description: 'Личный стартап - современная платформа для стриминга контента с лендингом. Первый релиз планируется на ноябрь-декабрь 2025',
      tech: ['React', 'Node.js', 'WebRTC', 'PostgreSQL'],
      image: '/img/ACHERON_logo.png',
      link: '/ACHERON/index.html',
      comingSoon: true,
      theme: 'acheron'
    }
  ];

  return (
    <section className="freelance-projects" id="projects">
      <div className="freelance-projects-content">
        
        <div className="section-header">
          <h2 className="section-title">Избранные проекты</h2>
          <p className="section-subtitle">Примеры моих работ и достижений</p>
        </div>

        <div className="projects-grid">
          {featuredProjects.map((project, index) => (
            <a 
              key={index} 
              href={project.link}
              className={`project-card ${project.comingSoon ? 'coming-soon' : ''} ${project.theme}-theme`}
              {...(project.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  {project.comingSoon ? (
                    <div className="project-coming-soon">
                      <i className="fas fa-globe"></i>
                      <span>Лендинг сервиса</span>
                    </div>
                  ) : (
                    <div className="project-link">
                      <i className="fas fa-external-link-alt"></i>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <div className="project-tech">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="projects-cta">
          <a href="/projects" className="cta-button">
            <i className="fas fa-arrow-right"></i>
            <span>Посмотреть все проекты</span>
          </a>
        </div>

      </div>
    </section>
  );
}
