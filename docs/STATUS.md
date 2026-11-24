# Project status — Orders & Products (dZENcode test task)

_Snapshot taken 2026-11-24, before recording the demo video._

## TL;DR
The test task is **functionally complete and deployed**. It runs from a single
`docker compose up --build` both locally and on the production VDS, and is
served over HTTPS on a public domain. Remaining work: record the demo video and
send the deliverables to the recruiter.

## Candidate / submission
- **Candidate:** Bohdan Lapa — claimed level **Middle** (React/TypeScript + Node.js).
- **Recruiter:** Nataliy, dZENcode (Telegram chat «JS | React/Богдан Лапа»).
- **Agreed deadline:** 2026-11-25.
- **Agreed deliverables:** private GitHub repo + live link + short demo video.

## Repository
- **Remote:** https://github.com/wtopar/dzencode-orders-products.git
- **Branch:** `main`
- **Local path:** `W:\dzencode`

## Deployment state (verified at snapshot time)

| Target | URL | Result |
|---|---|---|
| Local client | http://localhost/ | HTTP 200 |
| Local API | http://localhost/api/orders | HTTP 200 |
| Domain (HTTPS) | https://darthvader.pp.ua/ | HTTP 200 |
| Domain (HTTP) | http://darthvader.pp.ua/ | HTTP 301 → https:// |
| Origin IP | http://13.51.72.52/ | HTTP 200 |
| socket.io (local + domain) | /socket.io/ | handshake OK (`sid` issued) |

### Local (Docker Desktop on dev PC)
- `dzencode-client-1` — Up, `0.0.0.0:80->80/tcp`
- `dzencode-server-1` — Up, `3000/tcp`
- `dzencode-db-1` — Up (healthy), `3306/tcp`
- Builds and starts cleanly with `docker compose up --build`.

### Server (AWS EC2 VDS, Ubuntu — 13.51.72.52)
- `app-client-1`, `app-server-1`, `app-db-1` — all Up (db healthy).
- Started with `docker compose up -d`.
- SSH access via `deploy/dzencode-key.pem` (user `ubuntu`) — key is gitignored.

### Domain / TLS
- `darthvader.pp.ua` is proxied through **Cloudflare** (not pointed directly at the IP).
- Cloudflare **SSL/TLS mode: Flexible** (edge HTTPS → origin HTTP:80).
- **Always Use HTTPS** enabled → `http://` returns 301 to `https://`.
- Origin (server) currently listens on port 80 only; no TLS termination on the box itself.

## Feature checklist (per task spec — all implemented)
- Orders page: list, click → products panel beside it, close, 2 date formats,
  totals in 2 currencies, delete with confirmation modal.
- Products page: full list, filter by type, 2 date formats, 2 currencies, order name.
- Dashboard: stat cards + recharts, aggregation in a Web Worker.
- Top bar: live clock + active-sessions counter via Socket.io.
- Auth-gated (JWT, demo `admin / admin`), protected DELETE.
- PWA (installable, offline shell), i18n (ru/en), lazy routes, Web Storage,
  responsive/mobile layout, Vitest + RTL tests.
- Normalized MySQL schema (orders → products → prices), seeded on first run.

## What remains
1. **Record the demo video** (short walkthrough of the deployed app).
2. **Send to recruiter** (2026-11-25): GitHub repo link + https://darthvader.pp.ua + video.

## Notes / possible follow-ups (optional, not blocking)
- TLS is terminated at Cloudflare only. For end-to-end encryption one could add a
  Cloudflare Origin Certificate on the server (nginx :443) and switch CF to
  Full (strict). Not required for the test.
- Docker Desktop on the dev PC had failed to start due to a corrupt
  `AppData\Local\Docker\run\*.sock` file; fixed by renaming the `run` folder
  (old one kept as `run_bad_<timestamp>`). Documented here in case it recurs.
