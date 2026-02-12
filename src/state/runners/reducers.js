// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';

const initialRunnersState = {
  list: [],
  status: 'IDLE',
};

const runnersSlice = createSlice({
  name: 'runners',
  initialState: initialRunnersState,
  reducers: {
    setRunners: (state, action) => {
      const { runners } = action.payload;
      state.list = runners;
      state.status = 'IDLE';
    },
  },
});

export const { setRunners } = runnersSlice.actions;
export default runnersSlice.reducer;
