// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';

const initialSolutionsState = {
  list: [],
  status: 'IDLE',
};

const solutionsSlice = createSlice({
  name: 'solutions',
  initialState: initialSolutionsState,
  reducers: {
    setSolutions: (state, action) => {
      const { solutions } = action.payload;
      state.list = solutions;
      state.status = 'IDLE';
    },
  },
});

export const { setSolutions } = solutionsSlice.actions;
export default solutionsSlice.reducer;
