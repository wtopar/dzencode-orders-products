import axios from 'axios';
import type { Order, OrderInput, Product, ProductInput, User } from './types';

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
export const createOrder = (data: OrderInput) =>
  api.post<Order>('/orders', data).then((r) => r.data);
export const updateOrder = (id: number, data: OrderInput) =>
  api.put<Order>(`/orders/${id}`, data).then((r) => r.data);
export const deleteOrder = (id: number) =>
  api.delete(`/orders/${id}`).then((r) => r.data);
export const getProducts = (type?: string) =>
  api.get<Product[]>('/products', { params: type ? { type } : {} }).then((r) => r.data);
export const getProductTypes = () =>
  api.get<string[]>('/product-types').then((r) => r.data);
export const createProduct = (data: ProductInput) =>
  api.post<Product>('/products', data).then((r) => r.data);
export const updateProduct = (id: number, data: ProductInput) =>
  api.put<Product>(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`).then((r) => r.data);
export const getUsers = () => api.get<User[]>('/users').then((r) => r.data);
export const getSettings = () =>
  api.get<{ uahRate: number }>('/settings').then((r) => r.data);
export const updateSettings = (uahRate: number) =>
  api.put<{ uahRate: number }>('/settings', { uahRate }).then((r) => r.data);

export default api;
