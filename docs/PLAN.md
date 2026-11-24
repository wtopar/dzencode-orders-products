# Build plan — Orders & Products

## Target level: **Middle** (claimed)
We build a solid base and cover as much of the Junior+ **and** Middle checklist as is genuinely finishable in a day — breadth of checklist coverage is the goal, QA checks against the claimed level.

### Middle-checklist coverage (what we add on top of base)
Junior+: **TypeScript** (core), **i18n** (react-i18next), **JWT** (simple auth stub), **Web Storage** (persist filters/token), **Lazy Loading** (route-level code splitting), **Charts** (orders/products chart), **Maps** (one react-leaflet map).
Middle: **GraphQL** (Apollo endpoint alongside REST), **Web Workers** (offload totals/aggregation), **PWA** (vite-plugin-pwa, installable + offline shell), **EDA** (Socket.io event-driven updates), **FrontEnd Optimization** (code splitting, memoization, lazy images), **Task Runners** (npm scripts), **tests** (Vitest unit + RTL integration).

### Out of scope (honest) — won't fit one day
SSR/Next.js rebuild, microservices / micro-frontend / WebAssembly (Middle+). Noted in README as deliberate scope.

## Scope IN (today)
- [ ] Frontend: React + TypeScript (Vite), Redux Toolkit, React Router, Axios, Socket.io-client, Bootstrap, BEM, route/panel animations.
- [ ] Layout per screens: sidebar nav, top bar (live clock + active-sessions counter), content area.
- [ ] **Orders** page: list; click → products panel opens beside; close; per order title, product count, 2 date formats, total in 2 currencies; delete → confirm popup (modal).
- [ ] **Products** page: full list; filter by type (select); per product title, type, guarantee dates (2 formats), price (2 currencies), order name.
- [ ] Backend: Express REST (`/api/orders`, `/api/products`), Socket.io active-session counter, MySQL (mysql2) with seed.
- [ ] DB: `db/schema.sql` + `db/schema.mwb` (MySQL Workbench model).
- [ ] Docker: `docker-compose.yml` (client nginx, server node, db mysql) — `docker compose up` runs everything.
- [ ] README with install/run.
- [ ] Short demo video.

## Scope OUT (not today)
GraphQL, PWA, microservices, web workers, SSR/Next, i18n, charts/maps, integration tests.

## Cheap Junior+ extras (if time permits)
Web Storage (persist filter), lazy loading routes, basic form validation on delete confirm, simple unit test.

## Deploy (free)
Build is deploy-ready via Docker. Options (account signup = user):
1. **Render.com** — free web service from Docker, easiest.
2. **Fly.io** — free Docker VMs.
3. **AWS EC2 free tier** — 12-month free t2.micro (needs card); run `docker compose up`.
Publish happens once the account exists.

## Answers to recruiter's 3 questions (to send before starting)
1. Level claimed: Junior+ (React/TS).
2. Estimate: ~1 working day; deadline <date>.
3. Current situation: free to start today, no blockers / deploy depends on free-host account.
