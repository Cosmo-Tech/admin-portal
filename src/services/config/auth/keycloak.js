// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { ProtocolMode } from '@azure/msal-browser';
import { Auth, AuthKeycloakRedirect } from '@cosmotech/core';

// TODO: find a way to stock config
const AUTH_KEYCLOAK_CLIENT_ID = 'cosmotech-webapp-client';
const AUTH_KEYCLOAK_REALM = 'https://kubernetes.cosmotech.com/keycloak/realms/brewery';

let authorityDomain;
try {
  if (AUTH_KEYCLOAK_REALM) authorityDomain = new URL(AUTH_KEYCLOAK_REALM)?.hostname;
} catch (e) {
  console.error(`Failed to parse authority domain name from keycloak realm: "${AUTH_KEYCLOAK_REALM}"`);
}
const redirectUrl = `${window.location.protocol}//${window.location.host}/sign-in`;

const MSAL_KEYCLOAK_CONFIG = {
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
Auth.addProvider(AuthKeycloakRedirect).setConfig(MSAL_KEYCLOAK_CONFIG);
