// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import applicationStore from './state/Store.config.js';

createRoot(document.getElementById('root')).render(
  <Provider store={applicationStore}>
    <App />
  </Provider>
);
