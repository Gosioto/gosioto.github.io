# 🖼️ Фоновые изображения

## 📋 Описание

Эта папка предназначена для фоновых изображений страниц, секций и баннеров.

## 📁 Ожидаемые файлы:

### Главная страница:
- `hero-background.webp` - фон hero секции
- `hero-background-mobile.webp` - фон для мобильных
- `hero-background-tablet.webp` - фон для планшетов
- `hero-background-desktop.webp` - фон для десктопа

### Страницы авторизации:
- `auth-background.webp` - фон страниц входа/регистрации
- `login-background.webp` - фон страницы входа
- `register-background.webp` - фон страницы регистрации

### Контентные страницы:
- `stream-background.webp` - фон страницы стрима
- `game-background.webp` - фон страницы игры
- `profile-background.webp` - фон профиля
- `settings-background.webp` - фон настроек

### Декоративные фоны:
- `pattern-background.svg` - паттерн фона
- `gradient-background.svg` - градиентный фон
- `texture-background.webp` - текстурированный фон

## 🎯 Использование:

```tsx
// В CSS
.hero-section {
  background-image: url('/images/backgrounds/hero-background.webp');
  background-size: cover;
  background-position: center;
}

// В компонентах
<div 
  style={{ 
    backgroundImage: 'url(/images/backgrounds/auth-background.webp)' 
  }}
  className="min-h-screen bg-cover bg-center"
>
```

## 📏 Рекомендации:
- **Формат**: WebP для фотографий, SVG для паттернов
- **Размеры**: Адаптивные размеры для разных устройств
- **Оптимизация**: Сжатие без потери качества
- **Производительность**: Lazy loading для больших изображений
