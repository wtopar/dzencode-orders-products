import mysql from 'mysql2/promise';
import { orders, products, users } from './data.js';

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = 'root',
  DB_NAME = 'inventory',
} = process.env;

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return pool;
}

// Wait for MySQL to accept connections (Docker start-order safety).
async function waitForDb(retries = 30, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await getPool().query('SELECT 1');
      return;
    } catch (e) {
      console.log(`DB not ready (${i + 1}/${retries}): ${e.code || e.message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Database connection failed after retries');
}

async function createSchema() {
  const p = getPool();
  await p.query(`CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL
  ) ENGINE=InnoDB`);
  await p.query(`CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number INT NOT NULL,
    is_new TINYINT(1) NOT NULL DEFAULT 1,
    photo VARCHAR(512),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(128) NOT NULL,
    specification VARCHAR(512),
    guarantee_start DATETIME,
    guarantee_end DATETIME,
    order_id INT NOT NULL,
    date DATETIME NOT NULL,
    CONSTRAINT fk_products_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_products_type (type),
    INDEX idx_products_order (order_id)
  ) ENGINE=InnoDB`);
  await p.query(`CREATE TABLE IF NOT EXISTS prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    symbol VARCHAR(8) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_prices_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_prices_product (product_id)
  ) ENGINE=InnoDB`);
  await p.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(64) NOT NULL,
    status ENUM('active','blocked') NOT NULL DEFAULT 'active',
    created DATETIME NOT NULL
  ) ENGINE=InnoDB`);
}

async function seedIfEmpty() {
  const p = getPool();
  const [[{ cnt }]] = await p.query('SELECT COUNT(*) AS cnt FROM orders');
  if (cnt === 0) {
  console.log('Seeding database...');
  for (const o of orders) {
    await p.query('INSERT INTO orders (id, title, description, date) VALUES (?,?,?,?)', [
      o.id, o.title, o.description, o.date,
    ]);
  }
  for (const pr of products) {
    await p.query(
      `INSERT INTO products
       (id, serial_number, is_new, photo, title, type, specification, guarantee_start, guarantee_end, order_id, date)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [pr.id, pr.serialNumber, pr.isNew, pr.photo, pr.title, pr.type, pr.specification,
        pr.guarantee.start, pr.guarantee.end, pr.order, pr.date],
    );
    for (const price of pr.price) {
      await p.query('INSERT INTO prices (product_id, value, symbol, is_default) VALUES (?,?,?,?)', [
        pr.id, price.value, price.symbol, price.isDefault,
      ]);
    }
  }
  console.log('Seed complete.');
  }

  const [[{ ucnt }]] = await p.query('SELECT COUNT(*) AS ucnt FROM users');
  if (ucnt === 0) {
    console.log('Seeding users...');
    for (const u of users) {
      await p.query('INSERT INTO users (id, name, email, role, status, created) VALUES (?,?,?,?,?,?)',
        [u.id, u.name, u.email, u.role, u.status, u.created]);
    }
  }
}

export async function initDb() {
  await waitForDb();
  await createSchema();
  await seedIfEmpty();
}
