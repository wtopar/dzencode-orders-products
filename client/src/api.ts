import axios from 'axios';
import type { Order, Product, User } from './types';

// Relative baseURL: dev -> Vite proxy, prod -> nginx proxy (same origin)
const api = axios.create({ baseURL: '/api' });

// Simple JWT demo: attach token if present (Web Storage + JWT markers)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getOrders = () => api.get<Order[]>('/orders').then((r) => r.data);
export const getOrderProducts = (id: number) =>
  api.get<Product[]>(`/orders/${id}/products`).then((r) => r.data);
export const deleteOrder = (id: number) =>
  api.delete(`/orders/${id}`).then((r) => r.data);
export const getProducts = (type?: string) =>
  api.get<Product[]>('/products', { params: type ? { type } : {} }).then((r) => r.data);
export const getProductTypes = () =>
  api.get<string[]>('/product-types').then((r) => r.data);
export const getUsers = () => api.get<User[]>('/users').then((r) => r.data);

export default api;
