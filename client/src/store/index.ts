import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import orders from './ordersSlice';
import products from './productsSlice';
import sessions from './sessionsSlice';
import auth from './authSlice';
import ui from './uiSlice';

export const store = configureStore({
  reducer: { orders, products, sessions, auth, ui },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
