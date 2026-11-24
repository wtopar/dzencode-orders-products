# Отчёт по тестовому заданию — Orders & Products (dZENcode)

**Кандидат:** Богдан Лапа · заявленный уровень **Middle** (React/TypeScript + Node.js)
**Репозиторий:** https://github.com/wtopar/dzencode-orders-products
**Живой демо:** https://darthvader.pp.ua · демо-доступ `admin / admin`
**Дата:** 24.11.2026

---

## 1. Кратко

Fullstack SPA для учёта **приходов** (orders) и **товаров** (products) внутри них.
Приложение собирается и запускается одной командой `docker compose up --build` — и локально,
и на сервере. Живой демо развёрнут на VDS (AWS EC2) и отдаётся по HTTPS через Cloudflare.

Весь функционал реально работает с бэкендом: списки, фильтры, поиск, графики, real-time,
полный CRUD, редактируемый курс валют. Покрыт unit-тестами (10/10) и строгим `tsc` typecheck.

## 2. Задача

- **Приходы:** список; по клику открывается панель товаров рядом; две даты, суммарная
  стоимость в двух валютах, удаление с подтверждением.
- **Товары:** список с фильтром по типу; серийный номер, статус, сроки гарантии, цена в двух
  валютах, имя прихода.
- **Дашборд** с графиками; живой счётчик активных сессий (WebSocket).
- JWT-авторизация, запуск в Docker, аккуратный код с объяснимыми решениями.

## 3. Что реализовано

| Область | Реализация |
|---|---|
| Приходы | Список, панель товаров рядом, две даты, сумма в USD и UAH, **CRUD** (создание/правка/удаление), подтверждения |
| Товары | Сетка карточек, **фильтр по типу** + глобальный поиск, **CRUD**, статус/гарантия/цена/приход |
| Lazy loading | Список товаров грузится по 24 с догрузкой при скролле (IntersectionObserver) |
| Дашборд | Графики количества и стоимости по типам (recharts); **агрегация в Web Worker** |
| Real-time (EDA) | Счётчик активных сессий + авто-обновление списков через Socket.io |
| Авторизация | JWT: чтение открыто, любые изменения — только с токеном |
| Настройки | **Курс USD → UAH** редактируется в UI и пересчитывает цены всех товаров |
| Прочее | PWA (offline-оболочка), i18n (ru/en), адаптивная вёрстка, валидация форм |

## 4. Архитектура и стек

**Frontend:** React 19 + TypeScript (Vite), Redux Toolkit (slices + async thunks),
React Router с route-level lazy loading, Axios, Socket.io-client, Bootstrap + BEM, recharts,
Web Worker, PWA (vite-plugin-pwa), react-i18next.

**Backend:** Node.js + Express, Socket.io, MySQL 8 (mysql2), JWT (jsonwebtoken).

**Инфраструктура:** Docker + docker-compose — три контейнера: `client` (nginx + собранный SPA),
`server` (Express + WebSocket), `db` (MySQL). nginx отдаёт SPA и проксирует `/api` и `/socket.io`
на сервер. Тесты — Vitest + React Testing Library.

## 5. Схема данных

Нормализованная модель, три таблицы:

```
orders(id, title, description, date)
   └─1→∞ products(id, serial_number, is_new, title, type, specification,
                  guarantee_start, guarantee_end, order_id→orders, date)
            └─1→∞ prices(id, product_id→products, value, symbol, is_default)
settings(k, v)   — хранит редактируемый курс uah_rate
```

Удаление каскадное (`ON DELETE CASCADE`). Суммы приходов и данные для графиков считаются
SQL-агрегацией на сервере. Схема создаётся и наполняется демо-данными при первом старте.

## 6. Ключевые технические решения

- **Redux Toolkit** — предсказуемое состояние без лишнего бойлерплейта; async thunks для API.
- **Route-level lazy loading** — код страниц грузится по требованию, быстрый первый экран.
- **Web Worker** — агрегация для дашборда вынесена из главного потока, UI не подвисает.
- **Socket.io (event-driven)** — обновления приходят по событиям сервера (`orders:changed`,
  `products:changed`), а не поллингом; плюс счётчик активных сессий.
- **JWT на запись** — GET-эндпоинты открыты, все POST/PUT/DELETE защищены токеном.
- **Транзакции цен** — товар и его две цены (USD + UAH) пишутся атомарно.
- **Курс валют в настройках** — единый параметр `uah_rate`; при изменении все гривневые цены
  пересчитываются одним UPDATE от долларовой цены.
- **Lazy loading списка** — IntersectionObserver вместо виртуализации: просто и достаточно для
  объёма данных, с кнопкой «Показать ещё» как фолбэком.

## 7. Как запустить

```bash
git clone https://github.com/wtopar/dzencode-orders-products.git
cd dzencode-orders-products
docker compose up --build
# client: http://localhost  ·  API проксируется через nginx на /api
```

Dev-режим без Docker: `server` — `npm install && npm run dev` (нужен MySQL 8);
`client` — `npm install && npm run dev` (Vite проксирует `/api` и `/socket.io`).

## 8. Тестирование и качество

- **Unit-тесты:** Vitest + React Testing Library — 10/10 проходят (`npm test`).
- **Типизация:** строгий `tsc -b` (`npm run typecheck`) без ошибок; `strict`, `noUnusedLocals`.
- Проверены вручную: авторизация (401 без токена), валидация (400 + список полей), CRUD,
  пересчёт цен при смене курса, lazy loading, графики.

## 9. Деплой

Собирается где угодно, где есть Docker. Живой демо: AWS EC2 (Ubuntu), `docker compose up -d`,
HTTPS и редирект `http → https` через Cloudflare. Домен: **darthvader.pp.ua**.

## 10. Что улучшил бы дальше (осознанно вне объёма)

- GraphQL-эндпоинт рядом с REST.
- Хранить цену-источник только в USD и считать UAH на лету (вместо пересчёта строк).
- TLS до origin (Cloudflare Full strict) вместо Flexible.
- Серверная пагинация для очень больших списков и E2E-тесты (Playwright).

## 11. Ответы на вопросы рекрутёра

1. **Уровень:** Middle (React/TypeScript + Node.js).
2. **Оценка:** ~1 рабочий день; сдача в оговорённый срок.
3. **Блокеры:** нет; готов объяснить любое решение на созвоне.
