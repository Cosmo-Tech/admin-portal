// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import applicationStore from './state/store.config.js';

createRoot(document.getElementById('root')).render(
  <Provider store={applicationStore}>
    <App />
  </Provider>
);
