# Spotify Taste Summary

Веб-приложение: логин через Spotify и выжимка по любимым трекам, исполнителям и жанрам за разные периоды.

## 1. Создайте приложение в Spotify Developer Dashboard

1. Откройте https://developer.spotify.com/dashboard и войдите под своим аккаунтом.
2. Create app → укажите любое имя/описание.
3. В "Redirect URIs" добавьте: `http://127.0.0.1:8888/callback`
4. Сохраните, откройте Settings приложения — скопируйте **Client ID** и **Client Secret**.

## 2. Настройте переменные окружения

```bash
cp server/.env.example server/.env
```

Впишите в `server/.env` полученные `SPOTIFY_CLIENT_ID` и `SPOTIFY_CLIENT_SECRET`. Остальные значения можно оставить как есть для локальной разработки.

## 3. Установите зависимости и запустите

```bash
npm run install:all
npm run dev
```

Откройте http://127.0.0.1:5173.

Backend поднимется на порту 8888, frontend — на 5173 (Vite-прокси перенаправляет `/login` и `/refresh` на backend).

## Как это работает

- `GET /login` редиректит на Spotify OAuth (scope `user-top-read`).
- После согласия Spotify возвращает пользователя на `/callback`; backend обменивает код на access/refresh токены (единственный шаг, которому нужен Client Secret) и передаёт их фронтенду через фрагмент URL (`/summary#access_token=...`).
- Фронтенд сохраняет токены в `sessionStorage` браузера и сам ходит в Spotify Web API (`/me/top/tracks`, `/me/top/artists`) с заголовком `Authorization: Bearer ...` — без прокси через backend.
- Когда access token истекает (обычно через 1 час), фронтенд дёргает `POST /refresh` — единственный оставшийся backend-эндпоинт для данных, потому что обновление токена тоже требует Client Secret.
- Токены живут только в текущей вкладке браузера (`sessionStorage`) и пропадают при закрытии вкладки — при следующем визите нужно будет войти заново.

**Компромисс:** access/refresh токен хранится в JS-доступном `sessionStorage`, а не в httpOnly cookie — это стандартный подход для SPA, но он означает, что токен теоретически доступен через XSS. Для личного локального инструмента это приемлемо.

## Деплой на Render.com

В продакшене backend сам раздаёт собранный фронтенд (`client/dist`) — один сервис, один домен, не нужно поднимать два процесса и настраивать CORS.

1. Запушьте репозиторий на GitHub (или другой Git-провайдер, который поддерживает Render).
2. На [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**, укажите репозиторий — Render подхватит [render.yaml](render.yaml) из корня и сам создаст веб-сервис (build: `npm run build`, start: `npm start`).
3. При первом деплое Render запросит значения `SPOTIFY_CLIENT_ID` и `SPOTIFY_CLIENT_SECRET` (помечены `sync: false` в render.yaml) — впишите их в Environment на дашборде Render.
4. После деплоя Render выдаст домен вида `https://spotify-taste-summary.onrender.com` (или с суффиксом, если имя занято). Скопируйте его.
5. На developer.spotify.com/dashboard в Redirect URIs вашего приложения добавьте:
   ```
   https://<ваш-домен>.onrender.com/callback
   ```
   Можно оставить рядом и `http://127.0.0.1:8888/callback` для локальной разработки — Spotify разрешает несколько Redirect URIs одновременно.
6. `REDIRECT_URI` и `CLIENT_URL` можно не задавать вручную в Render — сервер сам берёт домен из встроенной переменной Render `RENDER_EXTERNAL_URL`.

**Development Mode:** новое приложение Spotify по умолчанию доступно только пользователям, добавленным вручную (до 25) в Dashboard → Settings → User Management. Чтобы открыть доступ всем, нужно подать заявку на Extended Quota Mode через форму в Dashboard.
