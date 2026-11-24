import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as apiClient from '../api';
import type { Product } from '../types';

interface ProductsState {
  items: Product[];
  types: string[];
  filterType: string;
  status: 'idle' | 'loading' | 'failed';
}

// Web Storage marker: remember the last chosen filter
const savedFilter = localStorage.getItem('productFilter') || '';

const initialState: ProductsState = {
  items: [],
  types: [],
  filterType: savedFilter,
  status: 'idle',
};

export const fetchProducts = createAsyncThunk('products/fetch', (type: string) =>
  apiClient.getProducts(type || undefined),
);
export const fetchTypes = createAsyncThunk('products/types', () => apiClient.getProductTypes());

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilter(state, action: { payload: string }) {
      state.filterType = action.payload;
      localStorage.setItem('productFilter', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.status = 'idle'; s.items = a.payload; })
      .addCase(fetchProducts.rejected, (s) => { s.status = 'failed'; })
      .addCase(fetchTypes.fulfilled, (s, a) => { s.types = a.payload; });
  },
});

export const { setFilter } = productsSlice.actions;
export default productsSlice.reducer;
