import { describe, it, expect } from 'vitest';
import { dateNumeric, dateNamed, money, defaultPrice, otherPrice } from './format';
import type { Price } from '../types';

describe('format utils', () => {
  it('formats a date as DD / MM / YYYY', () => {
    expect(dateNumeric('2017-06-29 12:09:33')).toBe('29 / 06 / 2017');
  });

  it('formats a date with a Russian month name', () => {
    expect(dateNamed('2017-09-06 00:00:00')).toBe('06 / Сен / 2017');
  });

  it('returns the raw value for an invalid date', () => {
    expect(dateNumeric('not-a-date')).toBe('not-a-date');
  });

  const prices: Price[] = [
    { value: 100, symbol: 'USD', isDefault: 0 },
    { value: 2600, symbol: 'UAH', isDefault: 1 },
  ];

  it('picks the default and the alternative price', () => {
    expect(defaultPrice(prices)?.symbol).toBe('UAH');
    expect(otherPrice(prices)?.symbol).toBe('USD');
  });

  it('formats money with a currency symbol', () => {
    expect(money({ value: 100, symbol: 'USD', isDefault: 0 })).toContain('$');
    expect(money(undefined)).toBe('—');
  });
});
