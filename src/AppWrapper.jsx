// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useSelector } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.jsx';
import { createAppTheme } from './themes';

export const AppWrapper = () => {
  const themeMode = useSelector((state) => state.theme.mode);
  const dynamicTheme = createAppTheme(themeMode);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};
