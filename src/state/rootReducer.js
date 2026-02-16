// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { combineReducers } from '@reduxjs/toolkit';
import { cosmoApi } from './api/apiSlice.js';
import appReducer from './app/reducers.js';
import authReducer from './auth/reducers.js';
import organizationsReducer from './organizations/reducers.js';
import runnersReducer from './runners/reducers.js';
import solutionsReducer from './solutions/reducers.js';
import themeReducer from './theme/reducers.js';
import usersReducer from './users/reducers.js';
import workspacesReducer from './workspaces/reducers.js';

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  theme: themeReducer,
  organizations: organizationsReducer,
  solutions: solutionsReducer,
  workspaces: workspacesReducer,
  runners: runnersReducer,
  users: usersReducer,
  [cosmoApi.reducerPath]: cosmoApi.reducer,
});

export default rootReducer;
