# Кастомный курсор для Freelance страницы

## Обзор

Кастомный курсор для страницы `/freelance` - это интерактивный элемент, который заменяет стандартный курсор мыши на кастомные формы (квадрат/круг) с эффектом инверсии цветов.

## Архитектура

### Компонент: `FreelanceCursor.tsx`

**Основные состояния:**
- `cursorPosition` - позиция курсора {x, y}
- `isHovering` - наведение на интерактивные элементы
- `isClicking` - состояние клика
- `isVisible` - видимость курсора
- `isWindowFocused` - фокус окна браузера

**Refs:**
- `lastUpdateTime` - для throttling обновлений
- `animationFrameId` - для requestAnimationFrame
- `cursorRef` - ссылка на DOM элемент курсора

## Логика работы

### 1. Отслеживание мыши

```typescript
const updateCursorPosition = useCallback((e: MouseEvent) => {
  // Проверка границ окна
  const isInWindow = e.clientX >= 0 && e.clientX <= window.innerWidth && 
                    e.clientY >= 0 && e.clientY <= window.innerHeight;
  
  if (!isInWindow) {
    setIsVisible(false);
    return;
  }
  
  // Throttling для производительности (60 FPS)
  if (now - lastUpdateTime.current >= 16) {
    // requestAnimationFrame для плавности
    animationFrameId.current = requestAnimationFrame(() => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    });
  }
}, []);
```

### 2. Определение интерактивных элементов

```typescript
const isInteractiveElement = useCallback((target: HTMLElement) => {
  const interactiveClasses = [
    'action-btn', 'nav-link', 'contact-item', 'footer-link', 
    'cta-button', 'form-submit', 'project-link', 'service-card', 
    'project-card', 'stat-item', 'form-input', 'form-textarea'
  ];
  
  const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'];
  
  // Проверка тега, классов и родительских элементов
  return interactiveTags.includes(target.tagName) ||
         interactiveClasses.some(cls => target.classList.contains(cls)) ||
         interactiveClasses.some(cls => target.closest(`.${cls}`)) ||
         interactiveTags.some(tag => target.closest(tag.toLowerCase()));
}, []);
```

### 3. Управление видимостью

```typescript
// Скрытие при потере фокуса окна
const handleWindowBlur = useCallback(() => {
  setIsWindowFocused(false);
  setIsVisible(false);
}, []);

// Скрытие при выходе за границы окна
if (!isInWindow) {
  setIsVisible(false);
  return;
}
```

## Стили и анимации

### CSS: `freelance.css`

**Базовые стили:**
```css
.freelance-cursor {
  position: fixed;
  background: #ffffff;
  border: 2px solid #ffffff;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  opacity: 1;
  visibility: visible;
}
```

**Состояния:**
- `.freelance-cursor.hidden` - скрытый курсор
- `.freelance-cursor.hover` - состояние hover
- `.freelance-cursor.click` - состояние клика

**Переходы:**
```css
transition: width 0.15s ease-out, 
            height 0.15s ease-out,
            background 0.15s ease-out,
            border 0.15s ease-out,
            border-radius 0.15s ease-out,
            opacity 0.15s ease-out;
```

## Динамические стили

### Размеры и формы

```typescript
const cursorStyles = useMemo(() => {
  const baseSize = 20;
  const baseOffset = -baseSize / 2;
  
  let size = baseSize;
  let offset = baseOffset;
  let borderRadius = 0;
  let scale = 1;
  
  if (isHovering) {
    size = 40;           // Круг при hover
    offset = -size / 2;
    borderRadius = 50;   // Делаем круг
  } else if (isClicking) {
    size = 15;           // Уменьшаем при клике
    offset = -size / 2;
    scale = 0.8;
  }
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${borderRadius}%`,
    transform: `translate3d(${cursorPosition.x + offset}px, ${cursorPosition.y + offset}px, 0) scale(${scale})`,
  };
}, [cursorPosition.x, cursorPosition.y, isHovering, isClicking]);
```

## Инверсия цветов

### Принцип работы

Используется CSS свойство `mix-blend-mode: difference`:

- **На светлом фоне:** курсор становится темным
- **На темном фоне:** курсор становится светлым  
- **На цветном фоне:** курсор инвертирует цвет
- **Пиксельная точность:** каждый пиксель инвертируется отдельно

### Fallback

```css
@supports not (mix-blend-mode: difference) {
  .freelance-cursor {
    background: #ffffff;
    border: 2px solid #ffffff;
  }
}
```

## События

### Обработчики событий

```typescript
// Движение мыши
document.addEventListener('mousemove', updateCursorPosition, { passive: true });

// Клики
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);

// Hover состояния
document.addEventListener('mouseover', handleMouseOver);
document.addEventListener('mouseout', handleMouseOut);

// Фокус окна
window.addEventListener('focus', handleWindowFocus);
window.addEventListener('blur', handleWindowBlur);
```

### Очистка

```typescript
return () => {
  // Отмена animation frame
  if (animationFrameId.current) {
    cancelAnimationFrame(animationFrameId.current);
  }
  
  // Удаление всех обработчиков
  document.removeEventListener('mousemove', updateCursorPosition);
  // ... остальные обработчики
};
```

## Производительность

### Оптимизации

1. **Throttling:** обновления максимум 60 раз в секунду (16ms)
2. **requestAnimationFrame:** для плавной анимации
3. **useCallback:** мемоизация функций
4. **useMemo:** мемоизация стилей и классов
5. **passive: true:** для mousemove событий

### CSS оптимизации

```css
will-change: transform, width, height;
backface-visibility: hidden;
transform-origin: center;
```

## Адаптивность

### Медиа-запросы

```css
/* Скрытие стандартного курсора только на устройствах с мышью */
@media (hover: hover) and (pointer: fine) {
  * {
    cursor: none !important;
  }
}

/* Скрытие кастомного курсора на touch устройствах */
@media (hover: none) or (pointer: coarse) {
  .freelance-cursor {
    display: none !important;
  }
}
```

## Отладка

### Логирование

```typescript
console.log('Cursor initialized at:', { x: centerX, y: centerY });
console.log('Cursor moved to:', { x: e.clientX, y: e.clientY });
console.log('Cursor classes:', classes, { isVisible, isWindowFocused, isHovering, isClicking });
```

### DevTools

- Поиск элемента: `[data-debug="cursor-element"]`
- Проверка стилей и позиции
- Мониторинг событий в Console

## Требования к курсору

### Основные требования

1. **Всегда видимый курсор**
   - Курсор должен быть виден всегда, никогда не исчезать
   - При наведении на любой элемент курсор остается видимым
   - Никаких эффектов исчезновения или пропадания

2. **Центрирование всех элементов**
   - Центр всех элементов курсора (квадрат, круг, кнопка, аватар) = центр невидимого системного курсора
   - Все анимации должны начинаться из центра курсора
   - Позиционирование через CSS `transform: translate(-50%, -50%)`

3. **Пиксельная инверсия цветов**
   - Использовать `mix-blend-mode: difference`
   - Базовые состояния (квадрат, круг): белый цвет (#ffffff) для видимости
   - Кнопка CLICK: черный фон с белым текстом и рамкой
   - Аватар: белый фон с белым текстом (эмодзи)
   - При наложении на черный объект - часть курсора становится черной
   - При наложении на белый объект - часть курсора становится белой
   - Каждый пиксель инвертируется отдельно, не весь курсор

4. **Производительность**
   - Throttling для mousemove событий (60 FPS)
   - Использование `requestAnimationFrame`
   - `passive: true` для событий
   - `will-change: transform` для GPU оптимизации

### Состояния курсора

#### 1. Пассивное состояние (квадрат)
- **Размер:** 20x20px
- **Форма:** квадрат (borderRadius: 0)
- **Цвет:** белый (#ffffff) с инверсией через `mix-blend-mode: difference`
- **Триггер:** обычное состояние, не наведение на интерактивные элементы

#### 2. Первое активное состояние (круг)
- **Размер:** 40x40px  
- **Форма:** круг (borderRadius: 50%)
- **Цвет:** белый (#ffffff) с инверсией через `mix-blend-mode: difference`
- **Триггер:** наведение на кликабельные элементы (но не кнопки)

#### 3. Второе активное состояние (кнопка CLICK)
- **Размер:** 80x30px
- **Форма:** прямоугольная кнопка (borderRadius: 0)
- **Цвет:** черный фон, белый текст, белая рамка
- **Текст:** "CLICK"
- **Триггер:** наведение на кнопки, ссылки, project-card
- **Анимация:** двухэтапная - сначала расширение по ширине, затем по высоте

#### 4. Третье активное состояние (аватар)
- **Размер:** 60x60px
- **Форма:** круг (borderRadius: 50%)
- **Цвет:** белый фон (#ffffff) с белым текстом (эмодзи)
- **Содержимое:** эмодзи усы и борода с моноклем 🧔👓
- **Триггер:** наведение на аватар профиля

### Элементы для трансформации

#### Кнопки (показывают "CLICK")
- `button` теги
- `.action-btn`, `.cta-button`, `.form-submit`
- `.freelance-header-menu-btn`, `.footer-link`, `.nav-link`
- `.project-card` и элементы внутри них
- Элементы с `role="button"`
- Ссылки `<a>` с href

#### Кликабельные элементы (показывают круг)
- `INPUT`, `TEXTAREA`, `SELECT`
- `.form-input`, `.form-textarea`
- `.nav-link`, `.project-link`
- `.freelance-header-logo`, `.mobile-nav-link`
- `.profile-avatar`
- `.service-card` (если кликабельная)
- `.project-overlay`
- `.contact-item`, `.contact-icon`

#### Аватар (показывает усы и бороду)
- `.profile-avatar` и элементы внутри

### Приоритет состояний
1. **Аватар** (высший приоритет)
2. **Кнопка CLICK** (средний приоритет)
3. **Круг** (низший приоритет)
4. **Квадрат** (по умолчанию)

### Анимации

#### Трансформация в кнопку CLICK
1. **Этап 1:** Квадрат (20x20px) расширяется по ширине до 80px
2. **Этап 2:** Затем расширяется по высоте до 30px
3. **Результат:** Кнопка CLICK (80x30px) с текстом

#### Центрирование анимации
- Все расширения происходят от центра курсора
- Использование `transform: translate(-50%, -50%)` для центрирования
- Позиционирование через `left: centerX, top: centerY` в JavaScript

### Технические требования

#### CSS требования
```css
.freelance-cursor {
  position: fixed !important;
  background: #ffffff !important; /* Белый для видимости */
  border: 2px solid #ffffff !important;
  mix-blend-mode: difference !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: translate(-50%, -50%) !important;
  pointer-events: none !important;
  z-index: 99999 !important;
}

.freelance-cursor.button {
  background: #000000 !important; /* Черный для кнопки */
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}
```

#### JavaScript требования
- Использование `useState` для состояний
- `useRef` для оптимизации производительности
- `useLayoutEffect` для инициализации
- `useMemo` для стилей и классов
- Обработка событий: `mousemove`, `mouseover`, `mouseout`, `scroll`, `wheel`

#### Производительность
- Throttling mousemove до 60 FPS (16ms)
- `requestAnimationFrame` для плавности
- `passive: true` для событий
- Отмена предыдущих animation frames
- Минимум console.log в продакшене

### Адаптивность
- Скрытие на touch устройствах: `@media (hover: none) or (pointer: coarse)`
- Скрытие стандартного курсора только на устройствах с мышью: `@media (hover: hover) and (pointer: fine)`

### Отладка
- Атрибут `data-debug="cursor-element"`
- Атрибут `data-states` с текущими состояниями
- Возможность проверки через DevTools

## Интерактивные элементы

### Классы для hover эффекта

```typescript
const interactiveClasses = [
  'action-btn', 'nav-link', 'contact-item', 'footer-link', 
  'cta-button', 'form-submit', 'project-link', 'service-card', 
  'project-card', 'stat-item', 'form-input', 'form-textarea'
];
```

### HTML теги

```typescript
const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'];
```

## Проблемы и решения

### 1. Курсор невидимый
**Проблема:** `mix-blend-mode: difference` делает черный цвет невидимым на темном фоне
**Решение:** Использовать белый цвет (`#ffffff`) вместо черного

### 2. Курсор "прыгает" при переходах
**Проблема:** CSS `transition: all` мешает `transform` обновлениям
**Решение:** Исключить `transform` из transition

### 3. Курсор исчезает при hover
**Проблема:** Конфликт с CSS hover эффектами
**Решение:** Использовать `mouseover`/`mouseout` вместо `mouseenter`/`mouseleave`

### 4. Производительность
**Проблема:** Слишком частые обновления позиции
**Решение:** Throttling с requestAnimationFrame

## Интеграция

### Подключение на странице

```tsx
// src/app/freelance/page.tsx
import FreelanceCursor from '@/components/freelance/FreelanceCursor';

export default function FreelancePage() {
  return (
    <>
      <FreelanceCursor />
      {/* Остальной контент */}
    </>
  );
}
```

### CSS импорт

```css
/* src/styles/freelance.css */
@import './freelance.css';
```

## Будущие улучшения

### Возможные доработки

1. **Анимации:** Добавить более сложные переходы
2. **Трейл эффект:** След за курсором
3. **Звуки:** Звуковые эффекты при взаимодействии
4. **Настройки:** Возможность отключения через пользовательские настройки
5. **Темы:** Разные стили курсора для разных тем

### Оптимизации

1. **Web Workers:** Вынести тяжелые вычисления в отдельный поток
2. **Canvas API:** Использовать Canvas для более сложных эффектов
3. **CSS Custom Properties:** Динамические CSS переменные
4. **Intersection Observer:** Оптимизация для больших страниц

## Заключение

Кастомный курсор представляет собой комплексное решение, объединяющее:
- Реактивное отслеживание мыши
- Динамические стили и анимации  
- Инверсию цветов через CSS blend modes
- Оптимизированную производительность
- Адаптивность для разных устройств

Реализация демонстрирует современные подходы к созданию интерактивных UI элементов в React/Next.js приложениях.
