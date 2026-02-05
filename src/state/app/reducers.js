// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';
import { APP_STATUS } from './constants.js';

const initialState = {
  status: APP_STATUS.IDLE,
  error: null,
  apiVersion: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppStatus: (state, action) => {
      state.status = action.payload.status;
      if (action.payload.error !== undefined) {
        state.error = action.payload.error;
      }
    },
    setApiVersion: (state, action) => {
      state.apiVersion = action.payload.apiVersion;
    },
    resetAppState: () => initialState,
  },
});

export const { setAppStatus, setApiVersion, resetAppState } = appSlice.actions;
export default appSlice.reducer;
