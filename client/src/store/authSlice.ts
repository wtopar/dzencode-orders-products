import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

interface AuthState {
  user: string | null;
  error: string | null;
}

export const login = createAsyncThunk(
  'auth/login',
  async (creds: { username: string; password: string }) => {
    const { data } = await api.post('/login', creds);
    localStorage.setItem('token', data.token);
    return data.username as string;
  },
);

const initialState: AuthState = {
  user: localStorage.getItem('token') ? 'admin' : null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (s, a) => { s.user = a.payload; s.error = null; })
      .addCase(login.rejected, (s) => { s.error = 'Неверный логин или пароль'; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
