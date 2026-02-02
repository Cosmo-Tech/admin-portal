// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';

const getInitialThemeMode = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('themeMode') || 'light';
    }
  } catch (e) {
    console.warn('Unable to access localStorage:', e);
  }
  return 'light';
};

const themeInitialState = {
  mode: getInitialThemeMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: themeInitialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
    },
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
