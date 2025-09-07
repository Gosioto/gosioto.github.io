// src/components/games/GamesSidebarMidjourney.tsx
'use client';

export default function GamesSidebarMidjourney() {
  return (
    <>
      {/* Жанры */}
      <div className="games-sidebar-section">
        <h3 className="games-sidebar-title">
          <i className="fas fa-tags mr-2"></i>
          Предпочитаемые жанры
        </h3>
        <ul className="games-sidebar-list">
          <li 
            className="games-sidebar-item cursor-help"
            title="Большие онлайн-миры с прокачкой и экономикой, где есть контент на года игры (но без ограничений - не как генш,zzz,WW и т.д.)"
          >
            MMO, прогрессивные ММО
          </li>
          <li 
            className="games-sidebar-item cursor-help"
            title="Игры о космосе и космических путешествиях, использование физики в играх (космической), а так же фантастика - тоже космическая"
          >
            Космические тематики и космо-RPG
          </li>
          <li 
            className="games-sidebar-item cursor-help"
            title="Пошаговые, реального времени и RTS, про космос - других фаворитов не нашел пока"
          >
            Стратегии (X3 - X4, Dawn of War)
          </li>
          <li 
            className="games-sidebar-item cursor-help"
            title="Вождения - только Saber Interactive, космо, фэнтези, фантастика. Множество ограничений на этот жанр"
          >
            Симуляторы
          </li>
          <li 
            className="games-sidebar-item cursor-help"
            title="Глубокие сюжеты и развитие персонажа, психологические и детективные сюжеты, сюжеты с малой выдачей информации."
          >
            Сюжетные RPG
          </li>
        </ul>
      </div>

      {/* Платформы */}
      <div className="games-sidebar-section">
        <h3 className="games-sidebar-title">
          <i className="fas fa-desktop mr-2"></i>
          Платформы
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
            <i className="fas fa-desktop mr-1"></i>PC
          </span>
          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
            <i className="fab fa-steam mr-1"></i>Steam
          </span>
          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
            <i className="fas fa-mobile-alt mr-1"></i>Mobile
          </span>
        </div>
      </div>

      {/* Достижения */}
      <div className="games-sidebar-section">
        <h3 className="games-sidebar-title">
          <i className="fas fa-trophy mr-2"></i>
          Последние достижения
        </h3>
        <ul className="games-sidebar-list">
          <li className="games-sidebar-item">
            <span className="text-yellow-500 mr-2">🏆</span>
            Мастер Witcher 3
          </li>
          <li className="games-sidebar-item">
            <span className="text-yellow-500 mr-2">🏆</span>
            Выживший GTFO
          </li>
          <li className="games-sidebar-item">
            <span className="text-yellow-500 mr-2">🏆</span>
            Стратег Dawn of War
          </li>
        </ul>
        <button 
          className="games-card-btn primary w-full mt-3"
          data-action="achievements"
          data-game="Общие достижения"
        >
          <i className="fas fa-list mr-2"></i>
          Все достижения
        </button>
      </div>

      {/* Контакты */}
      <div className="games-sidebar-section">
        <h3 className="games-sidebar-title">
          <i className="fas fa-user mr-2"></i>
          Контакты
        </h3>
        <ul className="games-sidebar-list">
          <li className="games-sidebar-item">
            <a 
              href="https://steamcommunity.com/id/Gosloto/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Steam - Gosloto. Никнейм - (S)Gosloto"
            >
              <i className="fab fa-steam mr-2"></i>
              Steam профиль
            </a>
          </li>
          <li className="games-sidebar-item">
            <a 
              href="https://discord.gg/gosloto" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <i className="fab fa-discord mr-2"></i>
              Discord: gosloto
            </a>
          </li>
        </ul>
      </div>

      {/* Скриншоты */}
      <div className="games-sidebar-section">
        <h3 className="games-sidebar-title">
          <i className="fas fa-images mr-2"></i>
          Скриншоты
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <img 
            src="/img/screenshot/screenshot1.jpg" 
            alt="Скриншот 1" 
            className="w-full h-20 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
            loading="lazy"
          />
          <img 
            src="/img/screenshot/screenshot2.jpg" 
            alt="Скриншот 2" 
            className="w-full h-20 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
            loading="lazy"
          />
          <img 
            src="/img/screenshot/screenshot3.jpg" 
            alt="Скриншот 3" 
            className="w-full h-20 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
            loading="lazy"
          />
        </div>
        <button className="games-card-btn w-full">
          <i className="fas fa-external-link-alt mr-2"></i>
          Показать все
        </button>
      </div>
    </>
  );
}
