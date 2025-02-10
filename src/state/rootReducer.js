// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { combineReducers } from '@reduxjs/toolkit';
import { cosmoApi } from './api/apiSlice.js';
import authReducer from './auth/reducers.js';
import organizationsReducer from './organizations/reducers.js';
import workspacesReducer from './workspaces/reducers.js';

const rootReducer = combineReducers({
  auth: authReducer,
  organizations: organizationsReducer,
  workspaces: workspacesReducer,
  [cosmoApi.reducerPath]: cosmoApi.reducer,
});

export default rootReducer;
