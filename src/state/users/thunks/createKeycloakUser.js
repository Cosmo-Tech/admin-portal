// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { getAxiosInstance, deriveKeycloakAdminUrl } from 'src/services/api/apiClient.js';
import { apiManager } from 'src/services/api/apiManager.js';
import { APP_ROLES } from 'src/services/config/accessControl/Roles.js';
import fetchRealmUsers from './fetchRealmUsers.js';

/**
 * Resolve the ID of a newly created user from the Location header or by username lookup.
 */
async function resolveNewUserId(axios, adminUrl, email, createdUserUrl) {
  if (createdUserUrl) {
    const id = createdUserUrl.split('/').at(-1);
    if (id) return id;
  }
  // Fallback: look up user by username (email)
  const { data: foundUsers } = await axios.get(`${adminUrl}/users`, {
    params: { username: email, exact: true },
  });
  return foundUsers?.[0]?.id || null;
}

/**
 * Assign the Platform.Admin realm role to a user.
 */
async function assignPlatformAdminRole(axios, adminUrl, userId) {
  const roleName = APP_ROLES.PlatformAdmin;
  const { data: roleRepresentation } = await axios.get(`${adminUrl}/roles/${encodeURIComponent(roleName)}`);
  await axios.post(`${adminUrl}/users/${userId}/role-mappings/realm`, [roleRepresentation]);
}

/**
 * Create a new user in Keycloak with a temporary password, then optionally
 * assign the Platform.Admin realm role.
 *
 * Keycloak Admin REST API:
 *  - POST /admin/realms/{realm}/users
 *  - GET  /admin/realms/{realm}/roles/{roleName}
 *  - POST /admin/realms/{realm}/users/{userId}/role-mappings/realm
 *
 * @param {{ fullName: string, email: string, password: string, role: string }} userData
 * @returns {Function} Redux thunk
 */
export default function createKeycloakUser({ fullName, email, password, role = 'user' }) {
  return async (dispatch) => {
    const apiConfig = apiManager.getApi();
    const realmUrl = apiConfig?.AUTH_KEYCLOAK_REALM;
    if (!realmUrl) {
      throw new Error('Keycloak realm not configured');
    }

    const adminUrl = deriveKeycloakAdminUrl(realmUrl);
    const axios = getAxiosInstance();

    // Split full name into firstName / lastName
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const userPayload = {
      firstName,
      lastName,
      email,
      username: email,
      enabled: true,
      emailVerified: false,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: true,
        },
      ],
    };

    // Step 1: Create the user — Keycloak returns 201 with a Location header
    let createdUserUrl;
    try {
      const response = await axios.post(`${adminUrl}/users`, userPayload);
      createdUserUrl = response.headers?.location || null;
    } catch (error) {
      const status = error.response?.status;
      if (status === 403) {
        const err = new Error(
          'Admin API access denied (403 Forbidden). ' +
            'The Platform.Admin role needs the realm-management:manage-users permission in Keycloak. ' +
            'Go to Keycloak → Realm Roles → Platform.Admin → Associated Roles → ' +
            'Add realm-management: manage-users.'
        );
        err.response = error.response;
        throw err;
      }
      if (status === 409) {
        const err = new Error(
          error.response?.data?.errorMessage || 'A user with this email or username already exists.'
        );
        err.response = error.response;
        throw err;
      }
      throw error;
    }

    // Step 2: If the role is Platform.Admin, assign the realm role
    if (role === 'admin') {
      try {
        const newUserId = await resolveNewUserId(axios, adminUrl, email, createdUserUrl);
        if (newUserId) {
          await assignPlatformAdminRole(axios, adminUrl, newUserId);
          console.log(`[Users] ✓ Platform.Admin role assigned to user ${newUserId}`);
        } else {
          console.warn('[Users] Could not resolve new user ID for role assignment');
        }
      } catch (roleError) {
        console.warn('[Users] User created but failed to assign Platform.Admin role:', roleError.message);
      }
    }

    // Refresh the users list so the new user appears in the table
    await dispatch(fetchRealmUsers());
  };
}
