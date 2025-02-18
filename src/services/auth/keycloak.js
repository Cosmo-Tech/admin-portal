// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { ProtocolMode } from '@azure/msal-browser';
import { Auth, AuthKeycloakRedirect } from '@cosmotech/core';

const getConfig = (apiConfig) => {
  const AUTH_KEYCLOAK_CLIENT_ID = apiConfig.AUTH_KEYCLOAK_CLIENT_ID;
  const AUTH_KEYCLOAK_REALM = apiConfig.AUTH_KEYCLOAK_REALM;
  const AUTH_KEYCLOAK_ROLES_JWT_CLAIM = apiConfig.AUTH_KEYCLOAK_ROLES_JWT_CLAIM;

  let authorityDomain;
  try {
    if (AUTH_KEYCLOAK_REALM) authorityDomain = new URL(AUTH_KEYCLOAK_REALM)?.hostname;
  } catch (e) {
    console.error(`Failed to parse authority domain name from keycloak realm: "${AUTH_KEYCLOAK_REALM}"`);
  }
  const redirectUrl = `${window.location.protocol}//${window.location.host}/sign-in`;

  return {
    rolesJwtClaim: AUTH_KEYCLOAK_ROLES_JWT_CLAIM,
    loginRequest: {},
    accessRequest: {},
    msalConfig: {
      auth: {
        protocolMode: ProtocolMode.OIDC,
        authorityMetadata: JSON.stringify({
          authorization_endpoint: `${AUTH_KEYCLOAK_REALM}/protocol/openid-connect/auth`,
          token_endpoint: `${AUTH_KEYCLOAK_REALM}/protocol/openid-connect/token`,
          issuer: AUTH_KEYCLOAK_REALM,
          userinfo_endpoint: `${AUTH_KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
          end_session_endpoint: `${AUTH_KEYCLOAK_REALM}/protocol/openid-connect/logout`,
        }),
        clientId: AUTH_KEYCLOAK_CLIENT_ID,
        redirectUri: redirectUrl,
        postLogoutRedirectUri: redirectUrl,
        authority: `${AUTH_KEYCLOAK_REALM}`,
        knownAuthorities: [authorityDomain],
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    },
  };
};

export const addAuthProvider = (name, apiConfig) => {
  const MSAL_KEYCLOAK_CONFIG = getConfig(apiConfig);
  Auth.addProvider({ ...AuthKeycloakRedirect, name }).setConfig(MSAL_KEYCLOAK_CONFIG);
};

export const resetAuthProviderConfig = (name, apiConfig) => {
  Auth.setProvider(name);
  const MSAL_KEYCLOAK_CONFIG = getConfig(apiConfig);
  // FIXME: update core lib to prevent console warning when provider already exists
  Auth.addProvider({ ...AuthKeycloakRedirect, name }).setConfig(MSAL_KEYCLOAK_CONFIG);
};
