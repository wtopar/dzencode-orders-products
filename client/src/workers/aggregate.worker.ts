import type { Product } from '../types';

export interface TypeAgg {
  type: string;
  count: number;
  totalUsd: number;
}

// Runs off the main thread: aggregates products by type (count + total USD value).
const ctx = self as unknown as Worker;

ctx.onmessage = (e: MessageEvent<Product[]>) => {
  const products = e.data || [];
  const map = new Map<string, TypeAgg>();
  for (const p of products) {
    const usd = p.price.find((x) => x.symbol === 'USD')?.value ?? 0;
    const cur = map.get(p.type) ?? { type: p.type, count: 0, totalUsd: 0 };
    cur.count += 1;
    cur.totalUsd += usd;
    map.set(p.type, cur);
  }
  ctx.postMessage(Array.from(map.values()));
};
