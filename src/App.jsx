// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useEffect } from 'react';
import { Auth } from '@cosmotech/core';
import AppRoutes from './AppRoutes.jsx';
import './services/config/auth/keycloak.js';
import { AUTH_STATUS } from './state/auth/constants.js';
import { useSetAuthData } from './state/auth/hooks.js';

function App() {
  const setAuthData = useSetAuthData();
  useEffect(() => {
    async function checkLogin() {
      if (localStorage.getItem('authProvider')) {
        try {
          const isAuthenticated = await Auth.isUserSignedIn();
          setAuthData({
            error: '',
            userEmail: isAuthenticated ? Auth.getUserEmail() : '',
            userId: isAuthenticated ? Auth.getUserId() : '',
            userName: isAuthenticated ? Auth.getUserName() : '',
            profilePic: isAuthenticated ? Auth.getUserPicUrl() : '',
            roles: isAuthenticated ? Auth.getUserRoles() : [],
            permissions: [],
            status: isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS,
          });
        } catch (error) {
          if (error?.name === 'BrowserAuthError') {
            // Ignore "token acquisition failed" error, it may happen when previously used MSAL config is not compatible
            // (e.g. when using local webapp and switching between environments & login providers)
            console.error(error);
          }
        }
      }
    }
    checkLogin();
  }, [setAuthData]);

  return <AppRoutes />;
}

export default App;
