// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Auth } from '@cosmotech/core';
import { AUTH_STATUS } from '../constants.js';
import { setAuthData } from '../reducers.js';

const UNKNOWN_ERROR_MESSAGE =
  'Unknown error. Authentication failed\nIf the problem persists, please contact your administrator.';

export const login = createAsyncThunk('auth/login', async (arg, thunkAPI) => {
  const { provider } = arg;
  const { dispatch } = thunkAPI;
  try {
    if (provider) {
      Auth.setProvider(provider);
      await Auth.signIn();
      const isAuthenticated = await Auth.isUserSignedIn();
      
      if (isAuthenticated) {
        const userEmail = Auth.getUserEmail();
        const userId = Auth.getUserId();
        const userName = Auth.getUserName();
        const userRoles = Auth.getUserRoles();
        
        // Log user authentication and roles
        console.log('[Auth] ========== USER LOGIN ==========');
        console.log('[Auth] User:', userName, `(${userEmail})`);
        console.log('[Auth] User ID:', userId);
        console.log('[Auth] JWT Roles:', userRoles);
        console.log('[Auth] ===============================');
      }
      
      dispatch(
        setAuthData({
          error: '',
          userEmail: isAuthenticated ? Auth.getUserEmail() : '',
          userId: isAuthenticated ? Auth.getUserId() : '',
          userName: isAuthenticated ? Auth.getUserName() : '',
          profilePic: isAuthenticated ? Auth.getUserPicUrl() : '',
          roles: isAuthenticated ? Auth.getUserRoles() : [],
          permissions: [],
          status: isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS,
        })
      );
    }
  } catch (error) {
    console.error('[Auth] Login error:', error);
    dispatch(
      setAuthData({
        error: error?.errorMessage ?? UNKNOWN_ERROR_MESSAGE,
        userEmail: '',
        userId: '',
        userName: '',
        profilePic: '',
        roles: [],
        permissions: [],
        status: AUTH_STATUS.DENIED,
      })
    );
  }
});
