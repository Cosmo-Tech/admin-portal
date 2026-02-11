// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Typography } from '@mui/material';
import { UsersTable } from '../components/UsersTable';
import { apiManager } from '../services/api/apiManager';
import { useAuth } from '../state/auth/hooks';
import { useGetPlatformUsersQuery } from '../state/graphApi/hooks';

const ADMIN_ROLE = 'Platform.Admin';
const ALLOWED_EMAIL = 'mahdi.falek@cosmotech.com';

export const Users = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const isAzure = apiManager.getAuthProviderType() === 'azure';
  const apiConfig = apiManager.getApi();
  const spObjectId = apiConfig?.SERVICE_PRINCIPAL_OBJECT_ID;

  // Check Platform.Admin role OR if user is in the allowed list
  const isAdmin = auth.roles?.includes(ADMIN_ROLE) || auth.userEmail === ALLOWED_EMAIL;

  // Only call the query for Azure APIs with a valid SP Object ID
  const shouldFetch = isAzure && isAdmin && !!spObjectId;
  const { data, isLoading, error } = useGetPlatformUsersQuery(
    { spObjectId },
    { skip: !shouldFetch }
  );

  // Non-Azure API: show unsupported message
  if (!isAzure) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">{t('users.unsupportedProvider')}</Alert>
      </Box>
    );
  }

  // Non-admin: show access denied
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">{t('users.accessDenied')}</Alert>
      </Box>
    );
  }

  // Missing SP Object ID configuration
  if (!spObjectId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="body2">
            {t('users.missingConfig')}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <div>
      <UsersTable
        users={data || []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
