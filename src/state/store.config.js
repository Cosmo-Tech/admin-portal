// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { configureStore } from '@reduxjs/toolkit';
import { apiManager } from '../services/api/apiManager';
import { cosmoApi } from './api/apiSlice';
import rootReducer from './rootReducer';
import { themeMiddleware } from './theme/themeMiddleware';

const applicationStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { api: apiManager.getApiClient() ?? {} },
      },
      serializableCheck: {
        ignoreState: true,
        ignoreActions: true,
      },
    })
      .concat(cosmoApi.middleware)
      .concat(themeMiddleware),
});
export default applicationStore;
