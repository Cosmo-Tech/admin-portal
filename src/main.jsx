// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.jsx';
import './i18n';
import applicationStore from './state/store.config.js';
import './styles.css';
import theme from './themes';

createRoot(document.getElementById('root')).render(
  <Provider store={applicationStore}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>
);
