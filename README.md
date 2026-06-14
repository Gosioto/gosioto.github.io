# Gosloto — сайт-визитка Ивана

**[Открыть сайт](https://gosioto.github.io)**  
**[Полная документация](public/txt/doc/01-naznachenie-i-obzor-proekta.txt)** (модули 01–20 в `public/txt/doc/`)

---

## О проекте

Многостраничное портфолио веб-разработчика на **Next.js 15** (App Router) с **статическим экспортом** для GitHub Pages. Показывает навыки, кейсы, хобби, игровую статистику Steam, контакты и отдельный лендинг Freelance.

Изначально сайт был на HTML/CSS/JS; текущая версия — **React 18 + TypeScript**.

---

## Стек

| Направление | Технологии |
|-------------|------------|
| Framework | Next.js 15, static export (`out/`) |
| UI | React 18, TypeScript, Tailwind CSS 3 |
| Анимации | Framer Motion (games-enhanced), CSS |
| Данные | Статические TS-файлы в `src/data/` |
| Деплой | GitHub Pages (содержимое `out/`) |

---

## Маршруты (App Router)

| URL | Описание |
|-----|----------|
| `/` | Главная: hero, навыки, кейсы, Pixel Ecosystem |
| `/about/` | Опыт, таймлайн, образование, хобби |
| `/skills/` | Навыки по категориям |
| `/projects/` | Кейсы и аккордеон проектов |
| `/hobbies/` | Сетка увлечений |
| `/hobbies/games/` | Steam-библиотека (основная версия) |
| `/hobbies/games-enhanced/` | Альтернативный UI (Framer Motion) |
| `/contact/` | Контакты и форма (EmailJS) |
| `/freelance/` | Лендинг услуг |

Демо-кейсы в `public/`: `/SKYT/`, `/sentinelguard/`, `/static-site-gen/` и др.

---

## Разработка

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # результат в out/
npm run lint
```

Подробнее: [05-sborka-i-publikatsiya.txt](public/txt/doc/05-sborka-i-publikatsiya.txt)

---

## Интерактив

- **Pixel Ecosystem** — canvas-симуляция на главной (ЛКМ — добавить, ПКМ — удалить)
- **Steam-галерея** — топ игр, текущие, библиотека, модалки скриншотов/достижений
- **Форма контакта** — EmailJS с honeypot и валидацией
- **NewsTab** — changelog версий сайта на страницах

---

## Документация по модулям

| Файл | Тема |
|------|------|
| [01](public/txt/doc/01-naznachenie-i-obzor-proekta.txt) | Обзор и индекс |
| [02](public/txt/doc/02-stek-i-zavisimosti.txt) | Стек |
| [03](public/txt/doc/03-struktura-katalogov.txt) | Структура репозитория |
| [04](public/txt/doc/04-marshruty-i-stranitsy.txt) | Маршруты |
| [05](public/txt/doc/05-sborka-i-publikatsiya.txt) | Сборка и публикация |
| [06](public/txt/doc/06-domen-poddomen-ssl.txt) | Домен и SSL |
| [07–09](public/txt/doc/07-glavnaya-stranitsa-i-komponenty.txt) | Главная |
| [08](public/txt/doc/08-obolochka-ui.txt) | Header, Footer, NewsTab |
| [10–16](public/txt/doc/10-about.txt) | Страницы About … Freelance |
| [14](public/txt/doc/14-games-steam.txt) | Игры Steam |
| [17](public/txt/doc/17-pixel-ecosystem.txt) | Pixel Ecosystem |
| [18–20](public/txt/doc/18-dannye-i-tipy.txt) | Данные, public, стили |

---

## Репозиторий

`https://github.com/Gosioto/gosioto.github.io`

### Ветка `admin_branch`

Админ-панель GOSLOTO (React) для **admin.gosloto.xyz**.  
Инструкция: [ADMIN-DEPLOY.md](ADMIN-DEPLOY.md)
