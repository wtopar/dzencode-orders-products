import { createSlice } from '@reduxjs/toolkit';

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: { count: 0 },
  reducers: {
    setSessions(state, action: { payload: number }) {
      state.count = action.payload;
    },
  },
});

export const { setSessions } = sessionsSlice.actions;
export default sessionsSlice.reducer;
