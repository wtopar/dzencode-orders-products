// Seed data for Orders & Products (shape mirrors docs/task-spec/data-model.app.js)
const TYPES = ['Monitors', 'Laptops', 'Phones', 'Printers', 'Keyboards'];
const TITLES = {
  Monitors: 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3',
  Laptops: 'Lenovo ThinkPad X1 Carbon Gen 11',
  Phones: 'Samsung Galaxy S23 Ultra 512GB',
  Printers: 'HP LaserJet Pro M404dn',
  Keyboards: 'Keychron K8 Pro Wireless',
};

const orders = [
  { id: 1, title: 'Длинное предлинное длиннючее название прихода', description: 'Поставка №1', date: '2017-06-29 12:09:33' },
  { id: 2, title: 'Order 2 — офисная техника', description: 'Поставка №2', date: '2017-07-14 09:20:00' },
  { id: 3, title: 'Order 3 — склад Киев', description: 'Поставка №3', date: '2017-08-01 15:45:10' },
  { id: 4, title: 'Order 4 — возврат/ремонт', description: 'Поставка №4', date: '2017-09-10 11:00:00' },
  { id: 5, title: 'Order 5 — новый квартал', description: 'Поставка №5', date: '2017-10-06 10:30:00' },
];

// 25 products distributed across the 5 orders (matches "Продукты / 25" mockup)
const products = [];
let pid = 1;
for (let i = 0; i < 25; i++) {
  const type = TYPES[i % TYPES.length];
  const orderId = (i % orders.length) + 1;
  const isNew = i % 3 === 0 ? 1 : 0;
  const usd = 100 + (i % 7) * 50;
  products.push({
    id: pid++,
    serialNumber: 1234 + i,
    isNew,
    photo: `/img/products/${type.toLowerCase()}.svg`,
    title: TITLES[type],
    type,
    specification: `Specification ${i + 1}`,
    guarantee: { start: '2017-06-29 12:09:33', end: '2025-06-08 12:09:33' },
    order: orderId,
    date: '2017-06-29 12:09:33',
    price: [
      { value: usd, symbol: 'USD', isDefault: 0 },
      { value: usd * 26, symbol: 'UAH', isDefault: 1 },
    ],
  });
}

const users = [
  { id: 1, name: 'Богдан Лапа', email: 'admin@dzencode.test', role: 'Администратор', status: 'active', created: '2017-06-29 12:09:33' },
  { id: 2, name: 'Наталья Дзен', email: 'n.dzen@dzencode.test', role: 'Менеджер', status: 'active', created: '2017-07-02 10:15:00' },
  { id: 3, name: 'Всеволод Кравец', email: 'v.kravets@dzencode.test', role: 'Разработчик', status: 'active', created: '2017-07-14 09:20:00' },
  { id: 4, name: 'Ирина Бондаренко', email: 'i.bondarenko@dzencode.test', role: 'Кладовщик', status: 'active', created: '2017-08-01 15:45:10' },
  { id: 5, name: 'Олег Марченко', email: 'o.marchenko@dzencode.test', role: 'Кладовщик', status: 'blocked', created: '2017-09-10 11:00:00' },
  { id: 6, name: 'Анна Соколова', email: 'a.sokolova@dzencode.test', role: 'Менеджер', status: 'active', created: '2017-10-06 10:30:00' },
];

export { orders, products, users };
