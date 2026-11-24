-- dZENcode test task — Orders & Products schema (MySQL 8)
-- Relations: orders 1—* products 1—* prices
-- Import into MySQL Workbench via: File > Import > Reverse Engineer MySQL Create Script

CREATE DATABASE IF NOT EXISTS inventory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventory;

DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  date        DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE products (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  serial_number   INT NOT NULL,
  is_new          TINYINT(1) NOT NULL DEFAULT 1,
  photo           VARCHAR(512),
  title           VARCHAR(255) NOT NULL,
  type            VARCHAR(128) NOT NULL,
  specification   VARCHAR(512),
  guarantee_start DATETIME,
  guarantee_end   DATETIME,
  order_id        INT NOT NULL,
  date            DATETIME NOT NULL,
  CONSTRAINT fk_products_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_products_type (type),
  INDEX idx_products_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE prices (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  value      DECIMAL(12,2) NOT NULL,
  symbol     VARCHAR(8) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_prices_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_prices_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE users (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(255) NOT NULL,
  email   VARCHAR(255) NOT NULL UNIQUE,
  role    VARCHAR(64) NOT NULL,
  status  ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created DATETIME NOT NULL
) ENGINE=InnoDB;
