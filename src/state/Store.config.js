// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { configureStore } from '@reduxjs/toolkit';
import { Api } from '../services/config/Api.js';
import { cosmoApi } from './api/apiSlice.js';
import rootReducer from './rootReducer.js';

const applicationStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { Api },
      },
      serializableCheck: {
        ignoreState: true,
        ignoreActions: true,
      },
    }).concat(cosmoApi.middleware),
});
export default applicationStore;
