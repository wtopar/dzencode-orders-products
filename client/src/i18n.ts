import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      common: { search: 'Поиск', loading: 'Загрузка…', nothingFound: 'Ничего не найдено' },
      nav: { orders: 'Приход', dashboard: 'Дашборд', groups: 'Группы', products: 'Продукты', users: 'Пользователи', settings: 'Настройки' },
      orders: { title: 'Приходы', products: 'Продукта', add: 'Добавить продукт', needLogin: 'Для удаления нужно войти. Демо-доступ: admin / admin.' },
      products: { title: 'Продукты', type: 'Тип', spec: 'Спецификация', all: 'Все типы', condition: 'Состояние', guarantee: 'Гарантия', price: 'Цена', added: 'Добавлен', order: 'Приход', loadMore: 'Показать ещё' },
      form: {
        newOrder: 'Новый приход', editOrder: 'Редактировать приход', deleteOrder: 'Удалить приход',
        newProduct: 'Новый продукт', editProduct: 'Редактировать продукт', deleteProduct: 'Удалить продукт',
        deleteProductConfirm: 'Вы уверены, что хотите удалить этот продукт?',
        title: 'Название', description: 'Описание', productTitle: 'Название', serial: 'Серийный номер',
        type: 'Тип', order: 'Приход', priceUsd: 'Цена, $', guaranteeStart: 'Гарантия с', guaranteeEnd: 'Гарантия по',
        spec: 'Спецификация', isNew: 'Новый (не Б/У)',
        save: 'Сохранить', saving: 'Сохранение…', cancel: 'Отмена',
        required: 'Заполните обязательное поле', fixFields: 'Проверьте выделенные поля', saveError: 'Не удалось сохранить. Попробуйте ещё раз.',
      },
      status: { new: 'новый', used: 'Б / У', free: 'свободен', repair: 'в ремонте', active: 'Активен', blocked: 'Заблокирован' },
      modal: { confirm: 'Вы уверены, что хотите удалить этот приход?', cancel: 'Отмена', delete: 'Удалить' },
      dashboard: { title: 'Дашборд', types: 'Типов', products: 'Продуктов', sum: 'Сумма, $', byType: 'Продуктов по типу', valueByType: 'Стоимость по типу, $', count: 'Кол-во' },
      users: { title: 'Пользователи', search: 'Поиск по имени или email', allRoles: 'Все роли', since: 'В системе с', empty: 'Никого не найдено' },
      settings: { title: 'Настройки', profile: 'Профиль', logout: 'Выйти', language: 'Язык интерфейса', prefs: 'Предпочтения', notify: 'Уведомления о новых приходах', compact: 'Компактные карточки', hints: 'Показывать подсказки', data: 'Данные', resetFilter: 'Сбросить сохранённый фильтр продуктов', reset: 'Сбросить', cleared: 'Сохранённые фильтры очищены' },
      login: { title: 'Вход в систему', login: 'Логин', password: 'Пароль', submit: 'Войти', submitting: 'Вход…', demo: 'Демо-доступ', error: 'Неверный логин или пароль' },
    },
  },
  en: {
    translation: {
      common: { search: 'Search', loading: 'Loading…', nothingFound: 'Nothing found' },
      nav: { orders: 'Orders', dashboard: 'Dashboard', groups: 'Groups', products: 'Products', users: 'Users', settings: 'Settings' },
      orders: { title: 'Orders', products: 'products', add: 'Add product', needLogin: 'Please log in to delete. Demo: admin / admin.' },
      products: { title: 'Products', type: 'Type', spec: 'Specification', all: 'All types', condition: 'Condition', guarantee: 'Warranty', price: 'Price', added: 'Added', order: 'Order', loadMore: 'Load more' },
      form: {
        newOrder: 'New order', editOrder: 'Edit order', deleteOrder: 'Delete order',
        newProduct: 'New product', editProduct: 'Edit product', deleteProduct: 'Delete product',
        deleteProductConfirm: 'Are you sure you want to delete this product?',
        title: 'Title', description: 'Description', productTitle: 'Title', serial: 'Serial number',
        type: 'Type', order: 'Order', priceUsd: 'Price, $', guaranteeStart: 'Warranty from', guaranteeEnd: 'Warranty to',
        spec: 'Specification', isNew: 'New (not used)',
        save: 'Save', saving: 'Saving…', cancel: 'Cancel',
        required: 'Please fill the required field', fixFields: 'Check the highlighted fields', saveError: 'Could not save. Please try again.',
      },
      status: { new: 'new', used: 'Used', free: 'free', repair: 'in repair', active: 'Active', blocked: 'Blocked' },
      modal: { confirm: 'Are you sure you want to delete this order?', cancel: 'Cancel', delete: 'Delete' },
      dashboard: { title: 'Dashboard', types: 'Types', products: 'Products', sum: 'Total, $', byType: 'Products by type', valueByType: 'Value by type, $', count: 'Count' },
      users: { title: 'Users', search: 'Search by name or email', allRoles: 'All roles', since: 'In the system since', empty: 'Nobody found' },
      settings: { title: 'Settings', profile: 'Profile', logout: 'Log out', language: 'Interface language', prefs: 'Preferences', notify: 'Notify about new orders', compact: 'Compact cards', hints: 'Show hints', data: 'Data', resetFilter: 'Reset saved products filter', reset: 'Reset', cleared: 'Saved filters cleared' },
      login: { title: 'Sign in', login: 'Login', password: 'Password', submit: 'Sign in', submitting: 'Signing in…', demo: 'Demo access', error: 'Invalid login or password' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
