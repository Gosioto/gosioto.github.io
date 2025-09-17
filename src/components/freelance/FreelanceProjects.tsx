// src/components/freelance/FreelanceProjects.tsx
'use client';

export default function FreelanceProjects() {
  const featuredProjects = [
    {
      title: 'SKYT - Трекер времени',
      description: 'Программа для контроля своего времени с интуитивным интерфейсом и подробной статистикой',
      tech: ['JavaScript', 'Vue.js', 'Node.js', 'PostgreSQL'],
      image: '/img/skyt.png',
      link: '/SKYT/index.html'
    },
    {
      title: 'SentinelGuard - Сетевой администратор',
      description: 'Администратор сети, разработанный на Python и NMap для мониторинга сетевой безопасности',
      tech: ['Python', 'NMap', 'Network Security', 'Bash'],
      image: '/img/shield-icon.png',
      link: '/sentinelguard/index.html'
    },
    {
      title: 'Оптимизация Пиксельной Экосистемы',
      description: 'Полный рефакторинг игры с React на Vanilla JS. Уменьшение размера бандла на 85%',
      tech: ['JavaScript ES6+', 'Canvas 2D API', 'Web Workers', 'CSS Custom Properties'],
      image: '/img/pixel.png',
      link: '/index.html#pixel-ecosystem-game'
    },
    {
      title: 'Static MarkForge - генератор сайтов',
      description: 'Браузерный генератор статических сайтов из Markdown. Drag-and-drop файл → готовый HTML за 60 секунд',
      tech: ['Vanilla JS ES2023', 'Marked.js', 'FileSaver.js', 'CSS Grid/Flex'],
      image: '/img/casein.png',
      link: '/static-site-gen/index.html'
    },
    {
      title: 'Стриминговая платформа',
      description: 'В разработке - современная платформа для стриминга контента',
      tech: ['React', 'Node.js', 'WebRTC', 'MongoDB'],
      image: '/img/projects/streaming.jpg',
      link: '/projects',
      comingSoon: true
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
            <div key={index} className={`project-card ${project.comingSoon ? 'coming-soon' : ''}`}>
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  {project.comingSoon ? (
                    <div className="project-coming-soon">
                      <i className="fas fa-clock"></i>
                      <span>Скоро</span>
                    </div>
                  ) : (
                    <a href={project.link} className="project-link">
                      <i className="fas fa-external-link-alt"></i>
                    </a>
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
            </div>
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
