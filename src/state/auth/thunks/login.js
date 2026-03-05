// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiManager } from 'src/services/api/apiManager';
import { Auth } from '@cosmotech/core';
import { AUTH_STATUS } from '../constants.js';
import { setAuthData } from '../reducers.js';

const UNKNOWN_ERROR_MESSAGE =
  'Unknown error. Authentication failed\nIf the problem persists, please contact your administrator.';

const setError = (dispatch, error, status = AUTH_STATUS.DENIED) => {
  dispatch(
    setAuthData({
      error,
      userEmail: '',
      userId: '',
      userName: '',
      profilePic: '',
      roles: [],
      permissions: [],
      status,
    })
  );
};

export const login = createAsyncThunk('auth/login', async (arg, thunkAPI) => {
  const { provider } = arg;
  const { dispatch } = thunkAPI;
  try {
    if (!provider) return;

    // Re-initialize the MSAL instance so the shared singleton inside
    // @cosmotech/core targets the correct Keycloak realm (or Azure tenant).
    await apiManager.resetAuthProvider(provider);
    Auth.setProvider(provider);
    await Auth.signIn();

    const isAuthenticated = await Auth.isUserSignedIn();
    const userRoles = isAuthenticated ? Auth.getUserRoles() : [];
    const resolvedPermissions = userRoles.includes('Platform.Admin') ? ['Platform.Admin'] : [...userRoles];

    dispatch(
      setAuthData({
        error: '',
        userEmail: isAuthenticated ? Auth.getUserEmail() : '',
        userId: isAuthenticated ? Auth.getUserId() : '',
        userName: isAuthenticated ? Auth.getUserName() : '',
        profilePic: isAuthenticated ? Auth.getUserPicUrl() : '',
        roles: userRoles,
        permissions: resolvedPermissions,
        status: isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS,
      })
    );
  } catch (error) {
    console.error('[Auth] Login error:', error);
    setError(dispatch, error?.errorMessage ?? UNKNOWN_ERROR_MESSAGE);
  }
});
