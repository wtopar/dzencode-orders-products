import { describe, it, expect } from 'vitest';
import reducer, { selectOrder, removeOrder } from './ordersSlice';
import type { Order } from '../types';

const order = (id: number): Order => ({
  id, title: `Order ${id}`, description: '', date: '2017-06-29 12:09:33',
  productCount: 0, total: [],
});

const base = {
  items: [order(1), order(2)],
  status: 'idle' as const,
  selectedId: null as number | null,
  selectedProducts: [],
  productsStatus: 'idle' as const,
};

describe('ordersSlice reducer', () => {
  it('selects an order', () => {
    const s = reducer(base, selectOrder(2));
    expect(s.selectedId).toBe(2);
  });

  it('clears selection and products on selectOrder(null)', () => {
    const s = reducer({ ...base, selectedId: 1, selectedProducts: [{} as never] }, selectOrder(null));
    expect(s.selectedId).toBeNull();
    expect(s.selectedProducts).toHaveLength(0);
  });

  it('removes an order on removeOrder.fulfilled', () => {
    const action = { type: removeOrder.fulfilled.type, payload: 1 };
    const s = reducer(base, action);
    expect(s.items.map((o) => o.id)).toEqual([2]);
  });
});
