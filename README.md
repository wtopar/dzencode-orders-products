# dZENcode Test Task — Orders & Products (SPA)

Fullstack SPA: **React + Redux Toolkit + React Router** frontend, **Node/Express + Socket.io** backend, **MySQL** database, fully **Dockerized**.

> Test assignment for dZENcode. Spec and screens: `docs/task-spec/`.

## Features
- **Orders** page — list of orders; click an order to open its products panel beside the list; close button; per order: title, product count, creation date in two formats, total price summed across products in two currencies; delete button → confirmation popup.
- **Products** page — all products with a filter by type (select); per product: title, type, guarantee dates in different formats, price in several currencies, order name.
- **Top menu** — live clock (real-time) + **active-sessions counter via Socket.io** (number of open app tabs across browsers).
- **Navigation menu** — routed links to Orders and Products, animated route transitions.

## Stack
| Layer | Tech |
|---|---|
| Frontend | React (Vite), Redux Toolkit, React Router, Axios, Socket.io-client, Bootstrap, BEM CSS, animations |
| Backend | Node.js, Express, Socket.io, MySQL (mysql2) |
| DB | MySQL 8 (schema in `db/schema.sql` + `db/schema.mwb` for MySQL Workbench) |
| Infra | Docker + docker-compose (client, server, db) |

## Run (Docker)
```bash
docker compose up --build
```
App: http://localhost:8080 · API: http://localhost:3000

## Run (dev, without Docker)
```bash
# backend
cd server && npm install && npm run dev
# frontend
cd client && npm install && npm run dev
```

See `docs/PLAN.md` for the build plan and scope.
