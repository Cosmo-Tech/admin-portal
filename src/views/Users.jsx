// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { UsersTable } from '../components/UsersTable';
import { USERS_STATUS } from '../state/users/constants.js';
import { useUsersListStatus, useUsersError } from '../state/users/hooks.js';

export const Users = () => {
  const { t } = useTranslation();
  const usersStatus = useUsersListStatus();
  const usersError = useUsersError();

  if (usersStatus === USERS_STATUS.LOADING) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t('users.loading')}</Typography>
      </Box>
    );
  }

  if (usersStatus === USERS_STATUS.ERROR) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {usersError || t('users.error')}
          </Typography>
          {usersError?.includes('403') && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {`Fix: Configure Keycloak Admin Console
→ Realm Roles → Platform.Admin
→ Associated Roles tab
→ Add: realm-management:view-users
→ Add: realm-management:view-events

Then log in again.`}
            </Typography>
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <div>
      <UsersTable />
    </div>
  );
};
