import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as apiClient from '../api';
import type { Order, Product } from '../types';

interface OrdersState {
  items: Order[];
  status: 'idle' | 'loading' | 'failed';
  selectedId: number | null;
  selectedProducts: Product[];
  productsStatus: 'idle' | 'loading' | 'failed';
}

const initialState: OrdersState = {
  items: [],
  status: 'idle',
  selectedId: null,
  selectedProducts: [],
  productsStatus: 'idle',
};

export const fetchOrders = createAsyncThunk('orders/fetch', () => apiClient.getOrders());
export const fetchOrderProducts = createAsyncThunk('orders/fetchProducts', (id: number) =>
  apiClient.getOrderProducts(id),
);
export const removeOrder = createAsyncThunk('orders/remove', async (id: number) => {
  await apiClient.deleteOrder(id);
  return id;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    selectOrder(state, action: { payload: number | null }) {
      state.selectedId = action.payload;
      if (action.payload === null) state.selectedProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.status = 'idle'; s.items = a.payload; })
      .addCase(fetchOrders.rejected, (s) => { s.status = 'failed'; })
      .addCase(fetchOrderProducts.pending, (s) => { s.productsStatus = 'loading'; })
      .addCase(fetchOrderProducts.fulfilled, (s, a) => {
        s.productsStatus = 'idle';
        s.selectedProducts = a.payload;
      })
      .addCase(fetchOrderProducts.rejected, (s) => { s.productsStatus = 'failed'; })
      .addCase(removeOrder.fulfilled, (s, a) => {
        s.items = s.items.filter((o) => o.id !== a.payload);
        if (s.selectedId === a.payload) { s.selectedId = null; s.selectedProducts = []; }
      });
  },
});

export const { selectOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
