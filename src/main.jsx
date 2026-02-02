// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppWrapper } from './AppWrapper';
import './i18n';
import applicationStore from './state/store.config.js';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <Provider store={applicationStore}>
    <AppWrapper />
  </Provider>
);
