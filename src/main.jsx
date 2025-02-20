// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import App from './App.jsx';
import theme from './themes';
import './i18n';
import './styles.css';
import applicationStore from './state/store.config.js';

createRoot(document.getElementById('root')).render(
  <Provider store={applicationStore}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>
);
