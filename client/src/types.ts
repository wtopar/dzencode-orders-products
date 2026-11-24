export interface Price {
  value: number;
  symbol: string;
  isDefault: number;
}

export interface Guarantee {
  start: string;
  end: string;
}

export interface Product {
  id: number;
  serialNumber: number;
  isNew: number;
  photo: string;
  title: string;
  type: string;
  specification: string;
  guarantee: Guarantee;
  order: number;
  orderTitle?: string;
  date: string;
  price: Price[];
}

export interface OrderTotal {
  symbol: string;
  value: number;
}

export interface Order {
  id: number;
  title: string;
  description: string;
  date: string;
  productCount: number;
  total: OrderTotal[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'blocked';
  created: string;
}

// Payload for creating/editing a product via the API.
export interface ProductInput {
  serialNumber: number;
  title: string;
  type: string;
  isNew: number;
  specification?: string;
  photo?: string;
  guarantee: Guarantee;
  order: number;
  priceUsd: number;
}

export interface OrderInput {
  title: string;
  description?: string;
}
