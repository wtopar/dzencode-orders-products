import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { search: '' },
  reducers: {
    setSearch(state, action: { payload: string }) {
      state.search = action.payload;
    },
    clearSearch(state) {
      state.search = '';
    },
  },
});

export const { setSearch, clearSearch } = uiSlice.actions;
export default uiSlice.reducer;
