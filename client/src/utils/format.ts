import type { Price } from '../types';

const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const pad = (n: number) => String(n).padStart(2, '0');

// "06 / 04 / 2017"
export function dateNumeric(value: string): string {
  const d = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`;
}

// "06 / Сен / 2017"
export function dateNamed(value: string): string {
  const d = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())} / ${MONTHS_RU[d.getMonth()]} / ${d.getFullYear()}`;
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
