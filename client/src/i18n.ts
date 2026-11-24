import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      nav: { orders: 'Приход', dashboard: 'Дашборд', groups: 'Группы', products: 'Продукты', users: 'Пользователи', settings: 'Настройки' },
      orders: { title: 'Приходы', products: 'Продукта', add: 'Добавить продукт' },
      products: { title: 'Продукты', type: 'Тип', spec: 'Спецификация', all: 'Все типы' },
      status: { new: 'новый', used: 'Б / У', free: 'свободен', repair: 'В ремонте' },
      modal: { confirm: 'Вы уверены, что хотите удалить этот приход?', cancel: 'Отмена', delete: 'Удалить' },
      top: { sessions: 'Активных сессий' },
    },
  },
  en: {
    translation: {
      nav: { orders: 'Orders', dashboard: 'Dashboard', groups: 'Groups', products: 'Products', users: 'Users', settings: 'Settings' },
      orders: { title: 'Orders', products: 'Products', add: 'Add product' },
      products: { title: 'Products', type: 'Type', spec: 'Specification', all: 'All types' },
      status: { new: 'new', used: 'Used', free: 'free', repair: 'In repair' },
      modal: { confirm: 'Are you sure you want to delete this order?', cancel: 'Cancel', delete: 'Delete' },
      top: { sessions: 'Active sessions' },
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
