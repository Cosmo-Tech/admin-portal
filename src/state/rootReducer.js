// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { combineReducers } from '@reduxjs/toolkit';
import { cosmoApi } from './api/apiSlice.js';
import appReducer from './app/reducers.js';
import authReducer from './auth/reducers.js';
import { graphApi } from './graphApi/graphApiSlice.js';
import organizationsReducer from './organizations/reducers.js';
import themeReducer from './theme/reducers.js';
import workspacesReducer from './workspaces/reducers.js';

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  theme: themeReducer,
  organizations: organizationsReducer,
  workspaces: workspacesReducer,
  [cosmoApi.reducerPath]: cosmoApi.reducer,
  [graphApi.reducerPath]: graphApi.reducer,
});

export default rootReducer;
