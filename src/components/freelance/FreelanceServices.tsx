// src/components/freelance/FreelanceServices.tsx
'use client';

import { useRef, useEffect, useState } from 'react';

export default function FreelanceServices() {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [navigationOffset, setNavigationOffset] = useState(28); // Начинаем с середины (третья копия)
  const [isTransitioning, setIsTransitioning] = useState(false); // Флаг для отслеживания перехода
  const carouselRef = useRef<HTMLDivElement>(null);

  const services = [
    // Базовые услуги (позиции 1-7) - от простых к сложным
    {
      icon: 'fas fa-globe',
      title: 'Сайты под ключ',
      description: 'Полный цикл разработки сайтов от дизайна до запуска',
      features: ['Дизайн', 'Разработка', 'Тестирование', 'Запуск'],
      complexity: 1
    },
    {
      icon: 'fas fa-paint-brush',
      title: 'UI/UX Дизайн',
      description: 'Создание интуитивных и красивых пользовательских интерфейсов',
      features: ['Прототипирование', 'Веб-дизайн', 'Мобильный дизайн', 'Брендинг'],
      complexity: 2
    },
    {
      icon: 'fas fa-code',
      title: 'Веб-разработка',
      description: 'Создание современных веб-приложений с использованием React, Next.js, Node.js',
      features: ['Frontend разработка', 'Backend API', 'Базы данных', 'Деплой и хостинг'],
      complexity: 3
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Мобильная разработка',
      description: 'Разработка мобильных приложений для iOS и Android',
      features: ['React Native', 'Flutter', 'Нативные приложения', 'Кроссплатформенность'],
      complexity: 4
    },
    {
      icon: 'fas fa-cogs',
      title: 'Автоматизация',
      description: 'Настройка CI/CD, автоматизация процессов разработки',
      features: ['DevOps', 'Docker', 'GitHub Actions', 'Мониторинг'],
      complexity: 5
    },
    {
      icon: 'fas fa-server',
      title: 'Деплой и серверы',
      description: 'CI/CD на ваши или арендованные серверы',
      features: ['Настройка серверов', 'CI/CD', 'Мониторинг', 'Бэкапы'],
      complexity: 6
    },
    {
      icon: 'fas fa-link',
      title: 'Домены',
      description: 'Аренда и настройка нужных вам доменов',
      features: ['Подбор доменов', 'Регистрация', 'DNS настройка', 'SSL сертификаты'],
      complexity: 7
    },
    // Продвинутые услуги (позиции 8-14) - от сложных к очень сложным
    {
      icon: 'fas fa-graduation-cap',
      title: 'Обучение и консультации',
      description: 'Консультации по архитектуре, CI/CD, DevOps и обучение команды',
      features: ['Архитектура систем', 'CI/CD внедрение', 'DevOps консультации', 'Обучение React/TS'],
      complexity: 8
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Кибербезопасность',
      description: 'Аудит безопасности, penetration testing и secure coding',
      features: ['Security audit', 'Penetration testing', 'Secure coding', 'Защита данных'],
      complexity: 9
    },
    {
      icon: 'fas fa-tasks',
      title: 'Автоматизация бизнес-процессов',
      description: 'Разработка скриптов, ботов и RPA решений для оптимизации бизнеса',
      features: ['Скрипты автоматизации', 'RPA решения', 'Бизнес-боты', 'Интеграции'],
      complexity: 10
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Аналитика и Data Science',
      description: 'Обработка данных, создание дашбордов, визуализация и машинное обучение',
      features: ['Обработка данных', 'Дашборды', 'Визуализация', 'Машинное обучение'],
      complexity: 11
    },
    {
      icon: 'fas fa-microchip',
      title: 'Интернет вещей (IoT)',
      description: 'Разработка IoT решений и интеграций для умных устройств',
      features: ['IoT устройства', 'Сенсоры', 'Умные системы', 'Интеграции'],
      complexity: 12
    },
    {
      icon: 'fas fa-vr-cardboard',
      title: 'AR/VR и WebGL',
      description: 'Создание интерактивных 3D визуализаций и VR-опыта',
      features: ['WebGL приложения', 'AR решения', 'VR опыт', '3D визуализация'],
      complexity: 13
    },
    {
      icon: 'fas fa-robot',
      title: 'ИИ-агенты и автоматизация',
      description: 'Создание кастомных ИИ-ассистентов, чат-ботов и агентов под задачи клиентов',
      features: ['Чат-боты для поддержки', 'Автоматизация рутины', 'Анализ данных', 'Генерация контента'],
      complexity: 14
    }
  ];

  // Создаем расширенный список услуг для бесшовного скроллинга
  const createExtendedServicesList = () => {
    // Создаем больше копий для полностью бесконечного эффекта
    return [...services, ...services, ...services, ...services, ...services]; // 5 копий
  };

  const extendedServices = createExtendedServicesList();

  // Новая логика для синхронного скроллинга с отступом в 5 позиций
  const getNavigationServices = () => {
    // Вычисляем индекс для "других услуг" с отступом в 5 позиций
    let navigationIndex = (activeServiceIndex + 5) % services.length;
    
    // Возвращаем 4 услуги начиная с navigationIndex, исключая активную
    const result = [];
    let currentIndex = navigationIndex;
    let addedCount = 0;
    
    while (addedCount < 4) {
      // Если текущий индекс не является активной услугой, добавляем его
      if (currentIndex !== activeServiceIndex) {
        result.push(services[currentIndex]);
        addedCount++;
      }
      // Переходим к следующему индексу
      currentIndex = (currentIndex + 1) % services.length;
    }
    
    return result;
  };

  // Обновляем позицию навигации при изменении активной услуги
  useEffect(() => {
    // Вычисляем позицию для первой услуги из списка "других услуг"
    const firstNavigationService = getNavigationServices()[0];
    const firstServiceIndex = services.findIndex(s => s.title === firstNavigationService.title);
    
    // Вычисляем все возможные позиции для первой услуги
    const possiblePositions = [
      firstServiceIndex, // Первая копия
      firstServiceIndex + services.length, // Вторая копия
      firstServiceIndex + services.length * 2, // Третья копия
      firstServiceIndex + services.length * 3, // Четвертая копия
      firstServiceIndex + services.length * 4 // Пятая копия
    ];
    
    // Находим ближайшую позицию к текущей
    const currentOffset = navigationOffset;
    let bestPosition = possiblePositions[0];
    let minDistance = Math.abs(possiblePositions[0] - currentOffset);
    
    for (let i = 1; i < possiblePositions.length; i++) {
      const distance = Math.abs(possiblePositions[i] - currentOffset);
      if (distance < minDistance) {
        minDistance = distance;
        bestPosition = possiblePositions[i];
      }
    }
    
    // Если расстояние слишком большое, делаем мгновенный переход
    if (minDistance > services.length * 0.8) {
      setIsTransitioning(true);
      setNavigationOffset(bestPosition);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    } else {
      // Плавный переход к ближайшей позиции
      setNavigationOffset(bestPosition);
    }
  }, [activeServiceIndex, navigationOffset]);

  const handleServiceClick = (index: number) => {
    // Вычисляем направление перехода для более плавной анимации
    const currentIndex = activeServiceIndex;
    const targetIndex = index;
    
    // Если переход через границу списка, выбираем более короткий путь
    let newIndex = targetIndex;
    if (Math.abs(targetIndex - currentIndex) > services.length / 2) {
      if (targetIndex > currentIndex) {
        newIndex = targetIndex - services.length;
      } else {
        newIndex = targetIndex + services.length;
      }
    }
    
    setActiveServiceIndex(newIndex);
  };

  const handlePrev = () => {
    setActiveServiceIndex((prev) => (prev > 0 ? prev - 1 : services.length - 1));
  };

  const handleNext = () => {
    setActiveServiceIndex((prev) => (prev < services.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    };

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    return () => carousel.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section className="freelance-services" id="services">
      <div className="freelance-services-content">
        
        <div className="section-header">
          <h2 className="section-title">Предлагаемые услуги</h2>
          <p className="section-subtitle">Полный спектр IT-услуг для вашего бизнеса</p>
        </div>

        <div className="services-container">
          {/* 3D Карусель */}
          <div className="services-carousel-container" ref={carouselRef}>
            <div className="carousel-controls">
              <button 
                className="carousel-btn prev-btn" 
                onClick={handlePrev}
                aria-label="Предыдущая услуга"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                className="carousel-btn next-btn" 
                onClick={handleNext}
                aria-label="Следующая услуга"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="services-carousel">
              {services.map((service, index) => {
                const isActive = index === activeServiceIndex;
                const isPrev = index === (activeServiceIndex - 1 + services.length) % services.length;
                const isNext = index === (activeServiceIndex + 1) % services.length;
                
                return (
                  <div
                    key={index}
                    className={`service-card ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''} ${isNext ? 'next' : ''}`}
                    onClick={() => handleServiceClick(index)}
                  >
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
                );
              })}
            </div>
          </div>

          {/* Боковая навигация */}
          <div className="services-navigation">
            <h3 className="navigation-title">Другие услуги</h3>
            <div className="navigation-list-container">
              <div 
                className="navigation-list"
                style={{
                  transform: `translateY(-${navigationOffset * 80}px)`,
                  transition: isTransitioning ? 'none' : 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                {extendedServices.map((service, index) => {
                  // Вычисляем оригинальный индекс для правильного отображения активного состояния
                  const originalIndex = index % services.length;
                  // Активная услуга никогда не должна быть активной в навигации
                  const isActive = originalIndex === activeServiceIndex;
                  return (
                    <button
                      key={`${originalIndex}-${Math.floor(index / services.length)}`}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleServiceClick(originalIndex)}
                      style={{
                        // Временно скрываем активную услугу в навигации
                        display: isActive ? 'none' : 'flex'
                      }}
                    >
                      <div className="nav-icon">
                        <i className={service.icon}></i>
                      </div>
                      <span className="nav-title">{service.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
