// Seed data for Orders & Products (shape mirrors docs/task-spec/data-model.app.js)
const TYPES = ['Monitors', 'Laptops', 'Phones', 'Printers', 'Keyboards'];

// Per-type catalog: uneven product counts + several real models with base USD
// prices, so the dashboard charts have genuinely varied data (not flat bars).
const CATALOG = {
  Monitors:  { count: 18, models: [
    ['Dell UltraSharp U2723QE 27" 4K', 620], ['LG 27GP850 Nano IPS 165Hz', 410],
    ['Gigabyte M28U 28" 4K 144Hz', 560], ['Samsung Odyssey G7 32"', 700]] },
  Laptops:   { count: 14, models: [
    ['Lenovo ThinkPad X1 Carbon Gen 11', 1750], ['Apple MacBook Pro 14 M3', 2200],
    ['Dell XPS 15 9530', 1900], ['ASUS ROG Zephyrus G14', 1650]] },
  Phones:    { count: 24, models: [
    ['Samsung Galaxy S23 Ultra 512GB', 1150], ['Apple iPhone 15 Pro 256GB', 1250],
    ['Google Pixel 8 Pro', 950], ['Xiaomi 13T Pro 12/512', 720]] },
  Printers:  { count: 8,  models: [
    ['HP LaserJet Pro M404dn', 330], ['Canon i-SENSYS MF445dw', 420],
    ['Epson EcoTank L3250', 260]] },
  Keyboards: { count: 30, models: [
    ['Keychron K8 Pro Wireless', 110], ['Logitech MX Keys S', 130],
    ['Razer BlackWidow V4 Pro', 170], ['HyperX Alloy Origins 65', 95]] },
};

const orders = [
  { id: 1, title: 'Длинное предлинное длиннючее название прихода', description: 'Поставка №1', date: '2017-06-29 12:09:33' },
  { id: 2, title: 'Order 2 — офисная техника', description: 'Поставка №2', date: '2017-07-14 09:20:00' },
  { id: 3, title: 'Order 3 — склад Киев', description: 'Поставка №3', date: '2017-08-01 15:45:10' },
  { id: 4, title: 'Order 4 — возврат/ремонт', description: 'Поставка №4', date: '2017-09-10 11:00:00' },
  { id: 5, title: 'Order 5 — новый квартал', description: 'Поставка №5', date: '2017-10-06 10:30:00' },
];

// Products generated from CATALOG: counts differ per type (Keyboards 11 … Printers 3),
// prices vary per unit, spread unevenly across the 5 orders and across time.
const START_POOL = ['2021-03-14 10:00:00', '2022-07-01 09:30:00', '2023-01-20 12:00:00', '2023-11-05 15:20:00', '2024-05-18 08:45:00'];
const END_POOL   = ['2024-03-14 10:00:00', '2025-07-01 09:30:00', '2026-01-20 12:00:00', '2025-11-05 15:20:00', '2027-05-18 08:45:00'];

const products = [];
let pid = 1;
let serial = 1024;
TYPES.forEach((type, ti) => {
  const { count, models } = CATALOG[type];
  for (let k = 0; k < count; k++) {
    const [name, base] = models[k % models.length];
    // deterministic ±12% variation so no two units share a price
    const variation = ((k * 37 + ti * 13) % 25) - 12;
    const usd = Math.max(20, Math.round((base * (1 + variation / 100)) / 5) * 5);
    const isNew = (k + ti) % 3 === 0 ? 1 : 0;
    const orderId = ((k * 2 + ti) % orders.length) + 1;
    const gi = (k + ti) % START_POOL.length;
    products.push({
      id: pid++,
      serialNumber: serial++,
      isNew,
      photo: `/img/products/${type.toLowerCase()}.svg`,
      title: name,
      type,
      specification: `${name} — ${isNew ? 'new, sealed' : 'used, tested'}`,
      guarantee: { start: START_POOL[gi], end: END_POOL[gi] },
      order: orderId,
      date: START_POOL[gi],
      price: [
        { value: usd, symbol: 'USD', isDefault: 0 },
        { value: usd * 41, symbol: 'UAH', isDefault: 1 },
      ],
    });
  }
});

const users = [
  { id: 1, name: 'Иван Петров', email: 'ivan.petrov@example.com', role: 'Администратор', status: 'active', created: '2017-06-29 12:09:33' },
  { id: 2, name: 'Мария Иванова', email: 'maria.ivanova@example.com', role: 'Менеджер', status: 'active', created: '2017-07-02 10:15:00' },
  { id: 3, name: 'Алексей Смирнов', email: 'alexey.smirnov@example.com', role: 'Разработчик', status: 'active', created: '2017-07-14 09:20:00' },
  { id: 4, name: 'Елена Кузнецова', email: 'elena.kuznetsova@example.com', role: 'Кладовщик', status: 'active', created: '2017-08-01 15:45:10' },
  { id: 5, name: 'Дмитрий Соколов', email: 'dmitry.sokolov@example.com', role: 'Кладовщик', status: 'blocked', created: '2017-09-10 11:00:00' },
  { id: 6, name: 'Ольга Новикова', email: 'olga.novikova@example.com', role: 'Менеджер', status: 'active', created: '2017-10-06 10:30:00' },
];

export { orders, products, users };
