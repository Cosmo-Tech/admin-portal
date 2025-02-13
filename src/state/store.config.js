// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api/api.js';
import { cosmoApi } from './api/apiSlice.js';
import rootReducer from './rootReducer.js';

const applicationStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { api },
      },
      serializableCheck: {
        ignoreState: true,
        ignoreActions: true,
      },
    }).concat(cosmoApi.middleware),
});
export default applicationStore;
