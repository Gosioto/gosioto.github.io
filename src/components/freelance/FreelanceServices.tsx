// src/components/freelance/FreelanceServices.tsx
'use client';

export default function FreelanceServices() {
  const services = [
    {
      icon: 'fas fa-code',
      title: 'Веб-разработка',
      description: 'Создание современных веб-приложений с использованием React, Next.js, Node.js',
      features: ['Frontend разработка', 'Backend API', 'Базы данных', 'Деплой и хостинг']
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Мобильная разработка',
      description: 'Разработка мобильных приложений для iOS и Android',
      features: ['React Native', 'Flutter', 'Нативные приложения', 'Кроссплатформенность']
    },
    {
      icon: 'fas fa-paint-brush',
      title: 'UI/UX Дизайн',
      description: 'Создание интуитивных и красивых пользовательских интерфейсов',
      features: ['Прототипирование', 'Веб-дизайн', 'Мобильный дизайн', 'Брендинг']
    },
    {
      icon: 'fas fa-cogs',
      title: 'Автоматизация',
      description: 'Настройка CI/CD, автоматизация процессов разработки',
      features: ['DevOps', 'Docker', 'GitHub Actions', 'Мониторинг']
    },
    {
      icon: 'fas fa-globe',
      title: 'Сайты под ключ',
      description: 'Полный цикл разработки сайтов от дизайна до запуска',
      features: ['Дизайн', 'Разработка', 'Тестирование', 'Запуск']
    },
    {
      icon: 'fas fa-server',
      title: 'Деплой и серверы',
      description: 'CI/CD на ваши или арендованные серверы',
      features: ['Настройка серверов', 'CI/CD', 'Мониторинг', 'Бэкапы']
    },
    {
      icon: 'fas fa-link',
      title: 'Домены',
      description: 'Аренда и настройка нужных вам доменов',
      features: ['Подбор доменов', 'Регистрация', 'DNS настройка', 'SSL сертификаты']
    }
  ];

  return (
    <section className="freelance-services" id="services">
      <div className="freelance-services-content">
        
        <div className="section-header">
          <h2 className="section-title">Предлагаемые услуги</h2>
          <p className="section-subtitle">Полный спектр IT-услуг для вашего бизнеса</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">
                <i className={service.icon}></i>
              </div>
              
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                
                <ul className="service-features">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="service-feature">
                      <i className="fas fa-check"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
