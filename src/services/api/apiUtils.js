// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

// Guess the type of auth provider from an API configuration object. Possible values are:
// - "azure" if an Azure app registration is found
// - "keycloak" if a Keycloak client is found
// - undefined if the configuration object does not match any of the values above
export const detectApiAuthProviderType = (api) => {
  if (api == null) return;
  if (api.AUTH_KEYCLOAK_CLIENT_ID && api.AUTH_KEYCLOAK_REALM) return 'keycloak';
  if (api.APP_REGISTRATION_CLIENT_ID && api.AZURE_TENANT_ID && api.COSMOTECH_API_SCOPE) return 'azure';
};

export const validateApi = (api) => {
  if (api == null) return;
  if (typeof api !== 'object') {
    console.warn('API configuration item is not an object');
    return null;
  }
  // TODO: validate expected keys for Azure and Keycloak API configs

  // TODO: return only known/expected configuration keys

  const sanitizedApiUrl = api.COSMOTECH_API_PATH.replace(/\/+$/, '');
  return { ...api, COSMOTECH_API_PATH: sanitizedApiUrl };
};

export const validateApis = (apis) => {
  if (apis == null) return {};
  if (typeof apis !== 'object') {
    console.warn('APIs configuration is not an object');
    return {};
  }

  const sanitizedApis = {};
  for (const [apiName, api] of Object.entries(apis)) {
    const sanitizedApi = validateApi(api);
    if (sanitizedApi != null) sanitizedApis[apiName] = sanitizedApi;
    else console.warn(`Ignoring API configuration item ${apiName}`);
  }

  return sanitizedApis;
};
