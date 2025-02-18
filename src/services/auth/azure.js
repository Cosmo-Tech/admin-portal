// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { AuthMSAL } from '@cosmotech/azure';
import { Auth } from '@cosmotech/core';

const getConfig = (apiConfig) => {
  const APP_REGISTRATION_CLIENT_ID = apiConfig.APP_REGISTRATION_CLIENT_ID;
  const AZURE_TENANT_ID = apiConfig.AZURE_TENANT_ID;
  const COSMOTECH_API_SCOPE = apiConfig.COSMOTECH_API_SCOPE;
  const PUBLIC_URL = apiConfig.PUBLIC_URL ?? '';

  return {
    loginRequest: { scopes: ['user.read'] },
    accessRequest: { scopes: [COSMOTECH_API_SCOPE] },
    msalConfig: {
      auth: {
        clientId: APP_REGISTRATION_CLIENT_ID,
        redirectUri: `${window.location.protocol}//${window.location.host}${PUBLIC_URL}/sign-in`,
        authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
        knownAuthorities: [`https://login.microsoftonline.com/${AZURE_TENANT_ID}`],
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    },
  };
};

export const addAuthProvider = (name, apiConfig) => {
  const MSAL_AZURE_CONFIG = getConfig(apiConfig);
  Auth.addProvider({ ...AuthMSAL, name }).setConfig(MSAL_AZURE_CONFIG);
};

export const resetAuthProviderConfig = (name, apiConfig) => {
  Auth.setProvider(name);
  const MSAL_AZURE_CONFIG = getConfig(apiConfig);
  // FIXME: update core lib to prevent console warning when provider already exists
  Auth.addProvider({ ...AuthMSAL, name }).setConfig(MSAL_AZURE_CONFIG);
};
