# Admin-панель GOSLOTO на admin.gosloto.xyz

Ветка **`admin_branch`** — код и CI для админки (React/Vite в `admin-portal/`).  
Ветка **`main`** — портфолио на **gosloto.xyz** (Next.js).

## Почему отдельная ветка — да, но одного репозитория мало

| Что | Отдельная ветка | Один репозиторий GitHub Pages |
|-----|-----------------|-------------------------------|
| Разделить код portfolio / admin | Да | — |
| Разные workflow (`deploy.yml` / `deploy-admin.yml`) | Да | — |
| **Два кастомных домена одновременно** | Нет | **Нет** — в Settings → Pages один custom domain на репозиторий |

Итого: **`admin_branch` — правильно для разработки и деплоя admin**.  
Чтобы **gosloto.xyz** и **admin.gosloto.xyz** работали **одновременно**, admin деплоится во **второй репозиторий** (см. ниже).

## Архитектура

```
main (Next.js)     → deploy.yml        → gosioto.github.io / gosloto.xyz
admin_branch (SPA) → deploy-admin.yml  → Gosioto/gosloto-admin → admin.gosloto.xyz
                                              ↑
                                         API: api.gosloto.xyz (VPS2)
```

## Шаг 1. Репозиторий для admin (один раз)

1. GitHub → **New repository**: `Gosioto/gosloto-admin` (пустой, без README).
2. **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main** / **/(root)**
3. Пока **не** включайте custom domain — добавим после первого деплоя.

## Шаг 2. Секреты и переменные в `gosioto.github.io`

**Settings → Secrets and variables → Actions**

| Имя | Тип | Значение |
|-----|-----|----------|
| `ADMIN_DEPLOY_TOKEN` | Secret | [Fine-grained PAT](https://github.com/settings/tokens) с **Contents: Read and write** на `gosloto-admin` |

**Settings → Variables → Actions**

| Имя | Значение |
|-----|----------|
| `ADMIN_PAGES_REPO` | `Gosioto/gosloto-admin` |

Без `ADMIN_PAGES_REPO` workflow соберёт admin, но зальёт preview в **тот же** Pages (перезапишет portfolio) — только для теста.

## Шаг 3. DNS

У регистратора **gosloto.xyz**:

| Запись | Тип | Значение |
|--------|-----|----------|
| `admin` | CNAME | `<org>.github.io` (как подскажет GitHub после шага 4) |

**main / gosloto.xyz** — без изменений.

## Шаг 4. Custom domain на admin-репозитории

После первого успешного `Deploy admin`:

1. Откройте **Gosioto/gosloto-admin** → **Settings → Pages**.
2. **Custom domain**: `admin.gosloto.xyz` → Save.
3. Enforce HTTPS — дождитесь зелёной галочки DNS check.

Workflow кладёт файл `CNAME` (`admin.gosloto.xyz`) в артефакт; GitHub подхватит его при деплое.

## Шаг 5. Деплой

```bash
git checkout admin_branch
git add admin-portal .github/workflows/deploy-admin.yml ADMIN-DEPLOY.md
git commit -m "Admin portal: GitHub Pages for admin.gosloto.xyz"
git push origin admin_branch
```

**Actions → Deploy admin** — зелёный статус.

Проверка:

- https://admin.gosloto.xyz/login  
- Баннер «API и база данных: в порядке» (нужен живой `https://api.gosloto.xyz`)

## Локальная разработка admin

```bash
cd admin-portal
npm install
npm run dev
# http://localhost:5173 — API через Vite proxy на localhost:8080
```

Production-сборка:

```bash
VITE_API_ORIGIN=https://api.gosloto.xyz npm run build
```

## Синхронизация с GOSLOTO.XYZ

Исходник admin — репозиторий **GOSLOTO.XYZ** (`frontend/`). После изменений там:

```powershell
robocopy C:\Rabo4aya\GIT\GOSLOTO.XYZ\frontend C:\Rabo4aya\GIT\gosioto.github.io\admin-portal /E /XD node_modules dist coverage .vite
git add admin-portal
git commit -m "Sync admin-portal from GOSLOTO.XYZ"
```

## Учётные данные (dev)

- `admin@localhost` / `AdminPass123` — только локально после `seed-users.ps1`

На проде — свои пользователи в PostgreSQL на VPS2.
