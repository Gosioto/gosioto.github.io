// src/data/skillsData.ts
import { SkillCategory } from '@/types/skills';

/** Порядок категорий на странице «Навыки» (меньше — выше) */
const CATEGORY_ORDER: Record<string, number> = {
  frontend: 1,
  backend: 2,
  tools: 3,
  testing: 4,
  devops: 5,
  additional: 6,
  soft: 7
};

export const skillsData: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Фронтенд-разработка',
    order: CATEGORY_ORDER.frontend,
    skills: [
      { id: 'html', name: 'HTML5', icon: 'fab fa-html5', percentage: 95, tooltip: 'Семантическая верстка, доступность, современные API', subcategory: 'Языки и разметка', order: 1 },
      { id: 'css', name: 'CSS3', icon: 'fab fa-css3-alt', percentage: 90, tooltip: 'Flexbox, Grid, анимации, препроцессоры', subcategory: 'Языки и разметка', order: 2 },
      { id: 'js', name: 'JavaScript', icon: 'fab fa-js', percentage: 85, tooltip: 'ES6+, асинхронное программирование, паттерны', subcategory: 'Языки и разметка', order: 3 },
      { id: 'typescript', name: 'TypeScript', icon: 'fas fa-code', percentage: 80, tooltip: 'Статическая типизация, интерфейсы, дженерики', subcategory: 'Языки и разметка', order: 4 },
      { id: 'react', name: 'React', icon: 'fab fa-react', percentage: 75, tooltip: 'Hooks, Context API, Redux, Next.js', subcategory: 'Фреймворки и библиотеки', order: 1 },
      { id: 'nextjs', name: 'Next.js', icon: 'fas fa-layer-group', percentage: 60, tooltip: 'SSR, SSG, API Routes, Middleware', subcategory: 'Фреймворки и библиотеки', order: 2 },
      { id: 'nuxtjs', name: 'Nuxt.js', icon: 'fas fa-layer-group', percentage: 60, tooltip: 'Vue SSR, статическая генерация, модули', subcategory: 'Фреймворки и библиотеки', order: 3 },
      { id: 'pwa', name: 'PWA', icon: 'fas fa-mobile-alt', percentage: 65, tooltip: 'Service Workers, Web App Manifest, оффлайн-режим', subcategory: 'Фреймворки и библиотеки', order: 4 },
      { id: 'vue', name: 'Vue.js', icon: 'fab fa-vuejs', percentage: 55, tooltip: 'Vuex, Vue Router, Composition API', subcategory: 'Фреймворки и библиотеки', order: 5 },
      { id: 'angular', name: 'Angular', icon: 'fab fa-angular', percentage: 55, tooltip: 'Components, Services, RxJS', subcategory: 'Фреймворки и библиотеки', order: 6 },
      { id: 'webgl', name: 'WebGL', icon: 'fas fa-cube', percentage: 55, tooltip: '3D-графика, шейдеры, Three.js', subcategory: 'Графика', order: 1 }
    ]
  },
  {
    id: 'backend',
    title: 'Бэкенд-разработка',
    order: CATEGORY_ORDER.backend,
    skills: [
      { id: 'python', name: 'Python', icon: 'fab fa-python', percentage: 75, tooltip: 'Django, Flask, скрипты, автоматизация, боты', subcategory: 'Языки', order: 1 },
      { id: 'node', name: 'Node.js', icon: 'fab fa-node-js', percentage: 55, tooltip: 'Express, REST API, аутентификация', subcategory: 'Языки', order: 2 },
      { id: 'rust', name: 'Rust', icon: 'fas fa-gears', percentage: 55, tooltip: 'Перспективное начало изучения: углубление в азы памяти, владение данными, производительность', subcategory: 'Языки', order: 3 },
      { id: 'express', name: 'Express.js', icon: 'fas fa-server', percentage: 50, tooltip: 'REST API, middleware, шаблонизация', subcategory: 'Фреймворки', order: 1 },
      { id: 'fastapi', name: 'FastAPI', icon: 'fas fa-bolt', percentage: 45, tooltip: 'Современный фреймворк, автоматическая документация', subcategory: 'Фреймворки', order: 2 },
      { id: 'flask', name: 'Flask', icon: 'fas fa-flask', percentage: 40, tooltip: 'Микрофреймворк, расширения, REST API', subcategory: 'Фреймворки', order: 3 },
      { id: 'db', name: 'Базы данных', icon: 'fas fa-database', percentage: 70, tooltip: 'PostgreSQL, SQLite, MongoDB', subcategory: 'Данные и API', order: 1 },
      { id: 'api', name: 'API дизайн', icon: 'fas fa-plug', percentage: 70, tooltip: 'REST, GraphQL, документация', subcategory: 'Данные и API', order: 2 },
      { id: 'postgresql', name: 'PostgreSQL', icon: 'fas fa-database', percentage: 65, tooltip: 'Реляционная БД, индексы, запросы', subcategory: 'Данные и API', order: 3 },
      { id: 'mongodb', name: 'MongoDB', icon: 'fas fa-leaf', percentage: 60, tooltip: 'NoSQL, документоориентированная БД', subcategory: 'Данные и API', order: 4 },
      { id: 'websocket', name: 'WebSocket', icon: 'fas fa-exchange-alt', percentage: 60, tooltip: 'Реальное время, сокеты, события', subcategory: 'Данные и API', order: 5 }
    ]
  },
  {
    id: 'tools',
    title: 'Инструменты разработки',
    order: CATEGORY_ORDER.tools,
    skills: [
      { id: 'git', name: 'Git', icon: 'fab fa-git-alt', percentage: 85, tooltip: 'Git, GitHub, контроль версий', subcategory: 'Контроль версий', order: 1 },
      { id: 'github', name: 'GitHub', icon: 'fab fa-github', percentage: 80, tooltip: 'Репозитории, Issues, Actions, Pages', subcategory: 'Контроль версий', order: 2 },
      { id: 'gitlab', name: 'GitLab', icon: 'fab fa-gitlab', percentage: 70, tooltip: 'CI/CD, репозитории, DevOps', subcategory: 'Контроль версий', order: 3 },
      { id: 'eslint', name: 'ESLint', icon: 'fas fa-check-circle', percentage: 75, tooltip: 'Линтинг кода, правила, автоправка', subcategory: 'Сборка и качество кода', order: 1 },
      { id: 'prettier', name: 'Prettier', icon: 'fas fa-code', percentage: 75, tooltip: 'Форматирование кода, стили', subcategory: 'Сборка и качество кода', order: 2 },
      { id: 'vite', name: 'Vite', icon: 'fas fa-bolt', percentage: 70, tooltip: 'Сборщик проектов, HMR, оптимизация', subcategory: 'Сборка и качество кода', order: 3 },
      { id: 'figma', name: 'Figma', icon: 'fab fa-figma', percentage: 65, tooltip: 'Дизайн интерфейсов, прототипы, компоненты', subcategory: 'Инфраструктура и дизайн', order: 1 },
      { id: 'storybook', name: 'Storybook', icon: 'fas fa-book', percentage: 60, tooltip: 'Документация компонентов, тестирование UI', subcategory: 'Инфраструктура и дизайн', order: 2 },
      { id: 'nginx', name: 'Nginx', icon: 'fas fa-server', percentage: 55, tooltip: 'Веб-сервер, реверс-прокси, балансировка', subcategory: 'Инфраструктура и дизайн', order: 3 },
      { id: 'docker', name: 'Docker', icon: 'fab fa-docker', percentage: 50, tooltip: 'Контейнеризация, Docker Compose', subcategory: 'Инфраструктура и дизайн', order: 4 }
    ]
  },
  {
    id: 'testing',
    title: 'Тестирование',
    order: CATEGORY_ORDER.testing,
    skills: [
      { id: 'jest', name: 'Jest', icon: 'fas fa-vial', percentage: 70, tooltip: 'Юнит-тесты, моки, покрытие кода', order: 1 },
      { id: 'rtl', name: 'React Testing Library', icon: 'fab fa-react', percentage: 65, tooltip: 'Тестирование React компонентов', order: 2 },
      { id: 'cypress', name: 'Cypress', icon: 'fas fa-vial', percentage: 60, tooltip: 'E2E тестирование, интеграционные тесты', order: 3 },
      { id: 'jasmine', name: 'Jasmine', icon: 'fas fa-vial', percentage: 55, tooltip: 'BDD тесты, спеки', order: 4 },
      { id: 'karma', name: 'Karma', icon: 'fas fa-vial', percentage: 50, tooltip: 'Тест раннер, браузеры', order: 5 }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps',
    order: CATEGORY_ORDER.devops,
    skills: [
      { id: 'github-actions', name: 'GitHub Actions', icon: 'fab fa-github', percentage: 65, tooltip: 'Автоматизация workflows, деплой', order: 1 },
      { id: 'ci-cd', name: 'CI/CD', icon: 'fas fa-cogs', percentage: 60, tooltip: 'Непрерывная интеграция и доставка', order: 2 },
      { id: 'monorepo', name: 'Монорепозитории', icon: 'fas fa-project-diagram', percentage: 55, tooltip: 'Управление несколькими проектами', order: 3 },
      { id: 'ansible', name: 'Ansible', icon: 'fas fa-cogs', percentage: 45, tooltip: 'Автоматизация конфигурации, деплой', order: 4 },
      { id: 'kubernetes', name: 'Kubernetes', icon: 'fas fa-dharmachakra', percentage: 40, tooltip: 'Оркестрация контейнеров, сервисы', order: 5 }
    ]
  },
  {
    id: 'additional',
    title: 'Дополнительные технологии',
    order: CATEGORY_ORDER.additional,
    skills: [
      { id: 'tailwind', name: 'Tailwind CSS', icon: 'fas fa-wind', percentage: 70, tooltip: 'Utility-first CSS, компоненты', subcategory: 'Стили и UI', order: 1 },
      { id: 'styled-components', name: 'Styled Components', icon: 'fas fa-palette', percentage: 65, tooltip: 'CSS-in-JS, темы, компоненты', subcategory: 'Стили и UI', order: 2 },
      { id: 'canvas', name: 'Canvas API', icon: 'fas fa-paint-brush', percentage: 65, tooltip: '2D-графика, анимации, игры', subcategory: 'Графика и визуализация', order: 1 },
      { id: 'chartjs', name: 'Chart.js', icon: 'fas fa-chart-bar', percentage: 60, tooltip: 'Графики, диаграммы, визуализация данных', subcategory: 'Графика и визуализация', order: 2 },
      { id: 'pinia', name: 'Pinia', icon: 'fas fa-database', percentage: 60, tooltip: 'State менеджмент для Vue 3', subcategory: 'Стили и UI', order: 3 },
      { id: 'rxjs', name: 'RxJS', icon: 'fas fa-stream', percentage: 60, tooltip: 'Реактивное программирование, потоки', subcategory: 'Реактивность и состояние', order: 1 },
      { id: 'angular-material', name: 'Angular Material', icon: 'fas fa-layer-group', percentage: 55, tooltip: 'UI компоненты для Angular', subcategory: 'Стили и UI', order: 4 },
      { id: 'threejs', name: 'Three.js', icon: 'fas fa-cube', percentage: 50, tooltip: '3D-графика в браузере, сцены, материалы', subcategory: 'Графика и визуализация', order: 3 }
    ]
  },
  {
    id: 'soft',
    title: 'Soft Skills',
    order: CATEGORY_ORDER.soft,
    skills: [
      { id: 'selflearning', name: 'Самообучение', icon: 'fas fa-book-open', percentage: 100, tooltip: 'Постоянное изучение новых технологий', subcategory: 'Личная эффективность', order: 1 },
      { id: 'timemanagement', name: 'Тайм-менеджмент', icon: 'fas fa-clock', percentage: 99, tooltip: 'Грамотное планирование и соблюдение дедлайнов', subcategory: 'Личная эффективность', order: 2 },
      { id: 'responsibility', name: 'Ответственность', icon: 'fas fa-shield-alt', percentage: 95, tooltip: 'Внимание к качеству кода и деталям проекта', subcategory: 'Личная эффективность', order: 3 },
      { id: 'communication', name: 'Коммуникация', icon: 'fas fa-comments', percentage: 90, tooltip: 'Чёткое и дружелюбное объяснение технических вещей', subcategory: 'Работа с людьми', order: 1 },
      { id: 'teamwork', name: 'Командная работа', icon: 'fas fa-users', percentage: 85, tooltip: 'Code-review, митинги, кросс-функциональные команды', subcategory: 'Работа с людьми', order: 2 },
      { id: 'empathy', name: 'Эмпатия', icon: 'fas fa-handshake', percentage: 85, tooltip: 'Понимание пользователей и коллег', subcategory: 'Работа с людьми', order: 3 },
      { id: 'organization', name: 'Организованность', icon: 'fas fa-tasks', percentage: 85, tooltip: 'Чёткая структура задач, документация и порядок в работе', subcategory: 'Организация и процессы', order: 1 },
      { id: 'criticalthinking', name: 'Критическое мышление', icon: 'fas fa-bullseye', percentage: 80, tooltip: 'Анализ проблем и обоснование решений', subcategory: 'Личная эффективность', order: 4 },
      { id: 'flexibility', name: 'Гибкость', icon: 'fas fa-adjust', percentage: 80, tooltip: 'Адаптация к изменениям и приоритетам', subcategory: 'Организация и процессы', order: 2 },
      { id: 'agile', name: 'Agile/Scrum', icon: 'fas fa-sync-alt', percentage: 80, tooltip: 'Гибкие методологии, спринты, ретроспективы', subcategory: 'Организация и процессы', order: 3 },
      { id: 'creativity', name: 'Креативность', icon: 'fas fa-lightbulb', percentage: 75, tooltip: 'Нестандартные решения и улучшение UX/UI', subcategory: 'Личная эффективность', order: 5 },
      { id: 'mentoring', name: 'Менторство', icon: 'fas fa-chalkboard-teacher', percentage: 75, tooltip: 'Обучение коллег, передача знаний', subcategory: 'Работа с людьми', order: 4 },
      { id: 'planning', name: 'Стратегическое планирование', icon: 'fas fa-chess', percentage: 75, tooltip: 'Долгосрочное планирование, приоритизация', subcategory: 'Организация и процессы', order: 4 }
    ]
  }
];