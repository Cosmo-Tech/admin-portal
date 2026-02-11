// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import axios from 'axios';
import { Auth } from '@cosmotech/core';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { jwtDecode } from 'jwt-decode';
import { apiManager } from './apiManager';
import { detectApiAuthProviderType } from './apiUtils';

// Microsoft Graph scopes for reading service principal assignments and user info
const GRAPH_SCOPES = [
  'https://graph.microsoft.com/Application.Read.All',
  'https://graph.microsoft.com/User.Read.All',
  'https://graph.microsoft.com/Directory.Read.All',
];

let consentMsalInstance = null;
let consentMsalInitPromise = null;
let consentPromise = null;

/**
 * Get or create a temporary MSAL instance used solely for interactive consent popups.
 */
const getConsentMsalInstance = async () => {
  if (consentMsalInstance) {
    await consentMsalInitPromise;
    return consentMsalInstance;
  }

  const apiConfig = apiManager.getApi();
  consentMsalInstance = new PublicClientApplication({
    auth: {
      clientId: apiConfig.APP_REGISTRATION_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${apiConfig.AZURE_TENANT_ID}`,
      knownAuthorities: [`https://login.microsoftonline.com/${apiConfig.AZURE_TENANT_ID}`],
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  });

  consentMsalInitPromise = consentMsalInstance.initialize();
  await consentMsalInitPromise;
  return consentMsalInstance;
};

/**
 * Determine if an error requires interactive user consent.
 */
const isConsentRequiredError = (error) => {
  if (error instanceof InteractionRequiredAuthError) return true;
  const errorStr = JSON.stringify(error).toLowerCase();
  return (
    errorStr.includes('interaction_required') ||
    errorStr.includes('consent_required') ||
    errorStr.includes('aadsts65001') ||
    errorStr.includes('invalid_grant')
  );
};


/**
 * Run the interactive consent popup, serialized via a shared promise.
 */
const acquireTokenWithConsent = async () => {
  if (consentPromise) {
    return consentPromise;
  }

  consentPromise = (async () => {
    try {
      console.log('[graphApiClient] Initializing MSAL for interactive consent popup...');
      const msalInstance = await getConsentMsalInstance();
      const accounts = msalInstance.getAllAccounts();
      const account = accounts.length > 0 ? accounts[0] : undefined;

      console.log(`[graphApiClient] Requesting interactive token with ${accounts.length} account(s) in cache...`);
      const response = await msalInstance.acquireTokenPopup({
        scopes: GRAPH_SCOPES,
        account,
      });
      console.log('[graphApiClient] Interactive consent popup succeeded.');
      return response.accessToken;
    } catch (error) {
      console.error('[graphApiClient] acquireTokenPopup failed:', error);
      throw error;
    } finally {
      consentPromise = null;
    }
  })();

  return consentPromise;
};

/**
 * Acquire a token for the Microsoft Graph API.
 * 1. Tries silent acquisition via Auth singleton
 * 2. If consent is required, triggers interactive popup
 * 3. Retries silent acquisition after consent
 */
const getGraphToken = async () => {
  const apiConfig = apiManager.getApi();
  if (!apiConfig) {
    throw new Error('[graphApiClient] No API selected.');
  }

  console.log('[graphApiClient] Attempting to acquire Microsoft Graph token...');

  // Step 1: Try silent acquisition via Auth singleton
  try {
    const tokenResponse = await Auth.acquireTokensByRequest({ scopes: GRAPH_SCOPES });
    if (tokenResponse?.accessToken) {
      console.log('[graphApiClient] Silent token acquisition succeeded.');
      return tokenResponse.accessToken;
    }
    console.warn('[graphApiClient] Silent acquisition returned no token');
  } catch (silentError) {
    const errorStr = JSON.stringify(silentError);
    console.error('[graphApiClient] Silent token acquisition failed:', errorStr);
    
    // Check if error explicitly indicates consent is needed
    const isConsentError = 
      errorStr.toLowerCase().includes('consent') ||
      errorStr.toLowerCase().includes('aadsts65001') ||
      errorStr.toLowerCase().includes('invalid_grant') ||
      errorStr.toLowerCase().includes('interaction');

    if (!isConsentError) {
      console.error('[graphApiClient] Error is NOT consent-related, re-throwing...');
      throw silentError;
    }

    console.warn('[graphApiClient] Consent error detected. Will attempt interactive popup...');
  }

  // Step 2: Interactive consent popup if silent failed with consent error
  console.log('[graphApiClient] Calling acquireTokenWithConsent...');
  try {
    const token = await acquireTokenWithConsent();
    if (token) {
      console.log('[graphApiClient] Successfully acquired token via interactive consent.');
      return token;
    }
    console.warn('[graphApiClient] acquireTokenWithConsent returned no token');
  } catch (popupError) {
    console.error('[graphApiClient] Interactive consent failed:', popupError);
    throw new Error(
      '[graphApiClient] Failed to acquire Microsoft Graph token. ' +
        'Popup consent may have been blocked or admin consent is required. ' +
        `Error: ${popupError?.message || JSON.stringify(popupError)}`
    );
  }

  throw new Error('[graphApiClient] Could not obtain a Microsoft Graph token.');
};

/**
 * Create an Axios instance with an interceptor that injects
 * the Microsoft Graph bearer token.
 */
const graphAxios = axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0',
});

graphAxios.interceptors.request.use(async (request) => {
  const apiConfig = apiManager.getApi();
  if (!apiConfig || detectApiAuthProviderType(apiConfig) !== 'azure') {
    throw new axios.Cancel('[graphApiClient] Microsoft Graph is only available for Azure APIs.');
  }

  try {
    // Acquire and inject token
    let token = await getGraphToken();
    if (token) {
      const decoded = jwtDecode(token);
      const remainingMinutes = Math.floor((decoded.exp - Date.now() / 1000) / 60);
      if (remainingMinutes <= 3) {
        try {
          const refreshed = await Auth.refreshTokens();
          if (refreshed?.accessToken) {
            token = refreshed.accessToken;
          }
        } catch (refreshError) {
          console.warn('[graphApiClient] Token refresh failed, using existing token:', refreshError?.message);
        }
      }
      request.headers.Authorization = `Bearer ${token}`;
    }
  } catch (tokenError) {
    console.error('[graphApiClient] Token acquisition failed:', tokenError?.message);
    throw tokenError;
  }

  return request;
});

// --- Service functions ---

/**
 * List all app role assignments for a service principal.
 * Returns users and groups assigned to the application.
 *
 * @param {string} spObjectId - Service Principal Object ID
 * @returns {Promise<Array>} Array of appRoleAssignment objects
 */
export const getAppRoleAssignments = async (spObjectId) => {
  const response = await graphAxios.get(`/servicePrincipals/${spObjectId}/appRoleAssignedTo`);
  return response.data.value || [];
};

/**
 * Get the service principal details including appRoles definitions.
 * Used to resolve appRoleId GUIDs to human-readable role names.
 *
 * @param {string} spObjectId - Service Principal Object ID
 * @returns {Promise<Array>} Array of appRole definition objects
 */
export const getAppRoles = async (spObjectId) => {
  const response = await graphAxios.get(`/servicePrincipals/${spObjectId}`, {
    params: { $select: 'appRoles' },
  });
  return response.data.appRoles || [];
};

/**
 * List members of a specific group.
 *
 * @param {string} groupId - Group Object ID
 * @returns {Promise<Array>} Array of group member objects
 */
export const getGroupMembers = async (groupId) => {
  const response = await graphAxios.get(`/groups/${groupId}/members`);
  return response.data.value || [];
};
