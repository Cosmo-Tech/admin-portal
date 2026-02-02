// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { combineReducers } from '@reduxjs/toolkit';
import { cosmoApi } from './api/apiSlice.js';
import authReducer from './auth/reducers.js';
import organizationsReducer from './organizations/reducers.js';
import themeReducer from './theme/reducers.js';
import workspacesReducer from './workspaces/reducers.js';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  organizations: organizationsReducer,
  workspaces: workspacesReducer,
  [cosmoApi.reducerPath]: cosmoApi.reducer,
});

export default rootReducer;
