import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getPool, initDb } from './db.js';

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
// Demo credentials (documented in README) — admin / admin
const DEMO_USER = { username: 'admin', password: 'admin' };

const app = express();
app.use(cors());
app.use(express.json());

// --- JWT auth -------------------------------------------------------------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/login — issue a JWT for the demo user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, username });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// --- helpers ---------------------------------------------------------------
async function loadPricesFor(productIds) {
  if (productIds.length === 0) return {};
  const p = getPool();
  const [rows] = await p.query(
    `SELECT product_id, value, symbol, is_default FROM prices WHERE product_id IN (?)`,
    [productIds],
  );
  const map = {};
  for (const r of rows) {
    (map[r.product_id] ||= []).push({
      value: Number(r.value), symbol: r.symbol, isDefault: r.is_default,
    });
  }
  return map;
}

function mapProduct(row, pricesMap) {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    isNew: row.is_new,
    photo: row.photo,
    title: row.title,
    type: row.type,
    specification: row.specification,
    guarantee: { start: row.guarantee_start, end: row.guarantee_end },
    order: row.order_id,
    orderTitle: row.order_title,
    date: row.date,
    price: pricesMap[row.id] || [],
  };
}

// --- REST API --------------------------------------------------------------
// GET /api/orders — list with product count + totals in both currencies
app.get('/api/orders', async (_req, res, next) => {
  try {
    const p = getPool();
    const [orders] = await p.query('SELECT * FROM orders ORDER BY id');
    const [counts] = await p.query(
      `SELECT o.id AS order_id,
              COUNT(DISTINCT pr.id) AS product_count,
              COALESCE(SUM(CASE WHEN pc.symbol='USD' THEN pc.value END),0) AS total_usd,
              COALESCE(SUM(CASE WHEN pc.symbol='UAH' THEN pc.value END),0) AS total_uah
       FROM orders o
       LEFT JOIN products pr ON pr.order_id = o.id
       LEFT JOIN prices pc ON pc.product_id = pr.id
       GROUP BY o.id`,
    );
    const byId = Object.fromEntries(counts.map((c) => [c.order_id, c]));
    res.json(orders.map((o) => ({
      ...o,
      productCount: byId[o.id]?.product_count || 0,
      total: [
        { symbol: 'USD', value: Number(byId[o.id]?.total_usd || 0) },
        { symbol: 'UAH', value: Number(byId[o.id]?.total_uah || 0) },
      ],
    })));
  } catch (e) { next(e); }
});

// GET /api/orders/:id/products — products of one order
app.get('/api/orders/:id/products', async (req, res, next) => {
  try {
    const p = getPool();
    const [rows] = await p.query(
      `SELECT pr.*, o.title AS order_title
       FROM products pr JOIN orders o ON o.id = pr.order_id
       WHERE pr.order_id = ? ORDER BY pr.id`, [req.params.id],
    );
    const pricesMap = await loadPricesFor(rows.map((r) => r.id));
    res.json(rows.map((r) => mapProduct(r, pricesMap)));
  } catch (e) { next(e); }
});

// DELETE /api/orders/:id — removes order (+ products via cascade). Requires JWT.
app.delete('/api/orders/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await getPool().query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    io.emit('orders:changed'); // event-driven: notify all clients
    res.json({ ok: true, id: Number(req.params.id) });
  } catch (e) { next(e); }
});

// GET /api/products?type=Monitors — all products, optional type filter
app.get('/api/products', async (req, res, next) => {
  try {
    const { type } = req.query;
    const p = getPool();
    const sql = `SELECT pr.*, o.title AS order_title
                 FROM products pr JOIN orders o ON o.id = pr.order_id
                 ${type ? 'WHERE pr.type = ?' : ''} ORDER BY pr.id`;
    const [rows] = await p.query(sql, type ? [type] : []);
    const pricesMap = await loadPricesFor(rows.map((r) => r.id));
    res.json(rows.map((r) => mapProduct(r, pricesMap)));
  } catch (e) { next(e); }
});

// GET /api/product-types — distinct types for the filter select
app.get('/api/product-types', async (_req, res, next) => {
  try {
    const [rows] = await getPool().query('SELECT DISTINCT type FROM products ORDER BY type');
    res.json(rows.map((r) => r.type));
  } catch (e) { next(e); }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Socket.io: active-session counter -------------------------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let activeSessions = 0;
io.on('connection', (socket) => {
  activeSessions++;
  io.emit('sessions', activeSessions);
  socket.on('disconnect', () => {
    activeSessions = Math.max(0, activeSessions - 1);
    io.emit('sessions', activeSessions);
  });
});

initDb()
  .then(() => server.listen(PORT, () => console.log(`API + WS on :${PORT}`)))
  .catch((e) => { console.error('DB init failed:', e); process.exit(1); });
