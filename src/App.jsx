// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { Auth } from '@cosmotech/core';
import AppRoutes from './AppRoutes.jsx';
import './services/auth/keycloak.js';
import { AUTH_STATUS } from './state/auth/constants.js';
import { useSetAuthData } from './state/auth/hooks.js';

function App() {
  const setAuthData = useSetAuthData();

  useEffect(() => {
    async function checkLogin() {
      if (!localStorage.getItem('authProvider')) return;

      try {
        const isAuthenticated = await Auth.isUserSignedIn();
        const authData = {
          error: '',
          userEmail: '',
          userId: '',
          userName: '',
          profilePic: '',
          roles: [],
          permissions: [],
          status: AUTH_STATUS.ANONYMOUS,
        };

        if (isAuthenticated) {
          authData.userEmail = Auth.getUserEmail();
          authData.userId = Auth.getUserId();
          authData.userName = Auth.getUserName();
          authData.profilePic = Auth.getUserPicUrl();
          authData.roles = Auth.getUserRoles();
          authData.status = AUTH_STATUS.AUTHENTICATED;
        }

        setAuthData(authData);
      } catch (error) {
        if (error?.name === 'BrowserAuthError') {
          // Ignore "token acquisition failed" error, it may happen when previously used MSAL config is not compatible
          // (e.g. when using local webapp and switching between environments & login providers)
          console.error(error);
        }
      }
    }
    checkLogin();
  }, [setAuthData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default App;
