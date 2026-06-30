# Mini App — Crypto Reality

React + Vite + TypeScript + Telegram WebApp SDK.

## Запуск

```bash
pnpm install
pnpm run dev
```

Или через Docker Compose из корня репозитория.

## Локальное тестирование без Telegram

В обычном браузере (вне Telegram) нет `window.Telegram.WebApp.initData`, поэтому API-запросы
не аутентифицированы и backend отвечает `401 INVALID_INIT_DATA` — это ожидаемо.

Чтобы прогнать полный flow в браузере, скопируй `.env.example` в `.env.local` и укажи
валидную, подписанную Telegram WebApp initData строку:

```bash
cp .env.example .env.local
# VITE_DEV_TMA_INIT_DATA=<valid signed initData>
```

Backend при этом не меняется и продолжает проверять подпись initData как обычно — это не bypass
авторизации, а просто способ подставить настоящую initData без реального Telegram-клиента.
Никогда не клади сюда боевые значения в `.env.example` — только в `.env.local` (он в `.gitignore`).

## Структура

```
src/
  main.tsx
  App.tsx
  pages/         # экраны (disclaimer, home, lobby, game, profile, leaderboard)
  components/    # переиспользуемые UI-блоки
  hooks/         # React hooks (useAuth, useGameState, ...)
  api/           # клиент к backend API
  telegram/      # обёртка над window.Telegram.WebApp
  i18n/          # ТОЛЬКО UI-строки (не игровой контент)
  types/         # TS типы (позже codegen из OpenAPI)
  styles/
```

Игровой контент (сценарии, события, выборы) НЕ хранится во фронте — приходит через API.
