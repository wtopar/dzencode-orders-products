import type { Price } from '../types';
import i18n from '../i18n';

const MONTHS_GEN_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n: number) => String(n).padStart(2, '0');
const isEn = () => (i18n.language || 'ru').startsWith('en');

// "29.06.2017"
export function dateNumeric(value: string): string {
  const d = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// "29 июня 2017" / "29 June 2017"
export function dateNamed(value: string): string {
  const d = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  const months = isEn() ? MONTHS_EN : MONTHS_GEN_RU;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function defaultPrice(prices: Price[]): Price | undefined {
  return prices.find((p) => p.isDefault) || prices[0];
}

export function otherPrice(prices: Price[]): Price | undefined {
  return prices.find((p) => !p.isDefault) || prices[1];
}

const SYMBOLS: Record<string, string> = { USD: '$', UAH: 'UAH', EUR: '€' };

export function money(p?: Price): string {
  if (!p) return '—';
  const sym = SYMBOLS[p.symbol] || p.symbol;
  const num = p.value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return p.symbol === 'USD' ? `${num} ${sym}` : `${num} ${sym}`;
}
