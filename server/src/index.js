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

// Accept 'YYYY-MM-DD' or a full datetime; normalize to MySQL DATETIME string.
function toDateTime(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s} 00:00:00`;
  return s.replace('T', ' ').slice(0, 19);
}

function nowDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

const UAH_RATE = 41; // demo FX rate (USD -> UAH)

// Build the two price rows (USD + default UAH) from the form payload.
function normalizePrices(body) {
  if (Array.isArray(body.price) && body.price.length) {
    return body.price.map((p) => ({
      value: Number(p.value) || 0,
      symbol: String(p.symbol || 'USD'),
      isDefault: p.isDefault ? 1 : 0,
    }));
  }
  const usd = Math.max(0, Number(body.priceUsd) || 0);
  return [
    { value: usd, symbol: 'USD', isDefault: 0 },
    { value: Math.round(usd * UAH_RATE * 100) / 100, symbol: 'UAH', isDefault: 1 },
  ];
}

// Return a list of invalid field names for a product payload ([] = valid).
function validateProduct(body = {}) {
  const errors = [];
  if (!body.title || !String(body.title).trim()) errors.push('title');
  if (body.serialNumber === undefined || body.serialNumber === null ||
      String(body.serialNumber).trim() === '' || Number.isNaN(Number(body.serialNumber))) {
    errors.push('serialNumber');
  }
  if (!body.type || !String(body.type).trim()) errors.push('type');
  if (!body.order || Number.isNaN(Number(body.order))) errors.push('order');
  const g = body.guarantee || {};
  if (g.start && g.end && new Date(toDateTime(g.end)) < new Date(toDateTime(g.start))) {
    errors.push('guaranteeEnd');
  }
  return errors;
}

async function fetchProductById(id) {
  const p = getPool();
  const [rows] = await p.query(
    `SELECT pr.*, o.title AS order_title
     FROM products pr JOIN orders o ON o.id = pr.order_id WHERE pr.id = ?`, [id],
  );
  if (!rows.length) return null;
  const pricesMap = await loadPricesFor([id]);
  return mapProduct(rows[0], pricesMap);
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

// POST /api/orders — create a new order (приход). Requires JWT.
app.post('/api/orders', requireAuth, async (req, res, next) => {
  try {
    const { title, description = '' } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required', fields: ['title'] });
    }
    const date = nowDateTime();
    const [r] = await getPool().query(
      'INSERT INTO orders (title, description, date) VALUES (?,?,?)',
      [String(title).trim(), description || '', date],
    );
    io.emit('orders:changed');
    res.status(201).json({ id: r.insertId, title: String(title).trim(), description: description || '', date });
  } catch (e) { next(e); }
});

// PUT /api/orders/:id — edit an order. Requires JWT.
app.put('/api/orders/:id', requireAuth, async (req, res, next) => {
  try {
    const { title, description = '' } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required', fields: ['title'] });
    }
    const p = getPool();
    const [[existing]] = await p.query('SELECT id FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Order not found' });
    await p.query('UPDATE orders SET title = ?, description = ? WHERE id = ?',
      [String(title).trim(), description || '', req.params.id]);
    io.emit('orders:changed');
    res.json({ id: Number(req.params.id), title: String(title).trim(), description: description || '' });
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

// GET /api/users — list of users
app.get('/api/users', async (_req, res, next) => {
  try {
    const [rows] = await getPool().query('SELECT id, name, email, role, status, created FROM users ORDER BY id');
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/products — create a product (with prices) under an order. Requires JWT.
app.post('/api/products', requireAuth, async (req, res, next) => {
  const conn = await getPool().getConnection();
  try {
    const b = req.body || {};
    const errors = validateProduct(b);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', fields: errors });
    const [[order]] = await conn.query('SELECT id FROM orders WHERE id = ?', [Number(b.order)]);
    if (!order) return res.status(400).json({ error: 'Order not found', fields: ['order'] });

    const date = nowDateTime();
    const gStart = toDateTime(b.guarantee?.start, date);
    const gEnd = toDateTime(b.guarantee?.end, date);
    const photo = b.photo || `/img/products/${String(b.type).toLowerCase()}.svg`;

    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO products
       (serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [Number(b.serialNumber), b.isNew ? 1 : 0, photo, String(b.title).trim(), String(b.type).trim(),
        b.specification || '', gStart, gEnd, Number(b.order), date],
    );
    for (const pr of normalizePrices(b)) {
      await conn.query('INSERT INTO prices (product_id, value, symbol, is_default) VALUES (?,?,?,?)',
        [r.insertId, pr.value, pr.symbol, pr.isDefault]);
    }
    await conn.commit();
    io.emit('orders:changed');
    io.emit('products:changed');
    res.status(201).json(await fetchProductById(r.insertId));
  } catch (e) {
    await conn.rollback().catch(() => {});
    next(e);
  } finally { conn.release(); }
});

// PUT /api/products/:id — edit a product (and its prices). Requires JWT.
app.put('/api/products/:id', requireAuth, async (req, res, next) => {
  const conn = await getPool().getConnection();
  try {
    const b = req.body || {};
    const errors = validateProduct(b);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', fields: errors });
    const [[existing]] = await conn.query('SELECT date FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const [[order]] = await conn.query('SELECT id FROM orders WHERE id = ?', [Number(b.order)]);
    if (!order) return res.status(400).json({ error: 'Order not found', fields: ['order'] });

    const gStart = toDateTime(b.guarantee?.start, existing.date);
    const gEnd = toDateTime(b.guarantee?.end, existing.date);
    const photo = b.photo || `/img/products/${String(b.type).toLowerCase()}.svg`;

    await conn.beginTransaction();
    await conn.query(
      `UPDATE products SET serial_number=?, is_new=?, photo=?, title=?, type=?, specification=?,
       guarantee_start=?, guarantee_end=?, order_id=? WHERE id=?`,
      [Number(b.serialNumber), b.isNew ? 1 : 0, photo, String(b.title).trim(), String(b.type).trim(),
        b.specification || '', gStart, gEnd, Number(b.order), req.params.id],
    );
    await conn.query('DELETE FROM prices WHERE product_id = ?', [req.params.id]);
    for (const pr of normalizePrices(b)) {
      await conn.query('INSERT INTO prices (product_id, value, symbol, is_default) VALUES (?,?,?,?)',
        [req.params.id, pr.value, pr.symbol, pr.isDefault]);
    }
    await conn.commit();
    io.emit('orders:changed');
    io.emit('products:changed');
    res.json(await fetchProductById(req.params.id));
  } catch (e) {
    await conn.rollback().catch(() => {});
    next(e);
  } finally { conn.release(); }
});

// DELETE /api/products/:id — remove a product (prices cascade). Requires JWT.
app.delete('/api/products/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await getPool().query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    io.emit('orders:changed');
    io.emit('products:changed');
    res.json({ ok: true, id: Number(req.params.id) });
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
