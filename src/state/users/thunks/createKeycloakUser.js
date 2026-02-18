// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { getAxiosInstance, deriveKeycloakAdminUrl } from 'src/services/api/apiClient.js';
import { apiManager } from 'src/services/api/apiManager.js';
import { APP_ROLES } from 'src/services/config/accessControl/Roles.js';
import fetchRealmUsers from './fetchRealmUsers.js';

/**
 * Sleep helper for short retry loops.
 */
const wait = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

/**
 * Extract user ID from Keycloak Location header.
 */
const extractUserIdFromLocation = (createdUserUrl) => {
  if (!createdUserUrl) return null;

  const sanitizedUrl = String(createdUserUrl).split('?')[0].replace(/\/+$/, '');
  const id = sanitizedUrl.split('/').filter(Boolean).at(-1);
  if (!id || id.toLowerCase() === 'users') return null;

  return id;
};

/**
 * Resolve the ID of a newly created user from the Location header or by username lookup.
 */
async function resolveNewUserId(axios, adminUrl, email, createdUserUrl, maxAttempts = 3, retryDelayMs = 250) {
  const idFromLocation = extractUserIdFromLocation(createdUserUrl);
  if (idFromLocation) return idFromLocation;

  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: foundUsers } = await axios.get(`${adminUrl}/users`, {
      params: { username: email, exact: true },
    });
    const resolvedUser = (foundUsers || []).find((user) => {
      const username = String(user?.username || '').toLowerCase();
      const userEmail = String(user?.email || '').toLowerCase();
      return username === normalizedEmail || userEmail === normalizedEmail;
    });
    if (resolvedUser?.id) return resolvedUser.id;

    if (attempt < maxAttempts) {
      await wait(retryDelayMs);
    }
  }

  return null;
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
 * Assign the Organization.User realm role to a user.
 */
async function assignOrganizationUserRole(axios, adminUrl, userId) {
  const roleName = APP_ROLES.OrganizationUser;
  const { data: roleRepresentation } = await axios.get(`${adminUrl}/roles/${encodeURIComponent(roleName)}`);
  await axios.post(`${adminUrl}/users/${userId}/role-mappings/realm`, [roleRepresentation]);
}

/**
 * Verify that the Platform.Admin realm role is assigned on the user.
 */
async function verifyPlatformAdminRole(axios, adminUrl, userId) {
  const expectedRole = APP_ROLES.PlatformAdmin.toLowerCase();
  const { data: roleMappings } = await axios.get(`${adminUrl}/users/${userId}/role-mappings/realm`);
  const hasPlatformAdminRole = (roleMappings || []).some(
    (role) => String(role?.name || '').toLowerCase() === expectedRole
  );
  if (!hasPlatformAdminRole) {
    throw new Error(`Platform.Admin role assignment verification failed for user ${userId}`);
  }
}

/**
 * Roll back a created user when post-creation role assignment fails.
 */
async function rollbackCreatedUser(axios, adminUrl, userId, email) {
  let rollbackUserId = userId;
  if (!rollbackUserId) {
    rollbackUserId = await resolveNewUserId(axios, adminUrl, email, null);
  }

  if (!rollbackUserId) {
    const error = new Error(
      `Could not resolve newly created user ID for rollback. Manual cleanup required for user ${email}.`
    );
    return { success: false, error, userId: null };
  }

  try {
    await axios.delete(`${adminUrl}/users/${rollbackUserId}`);
    return { success: true, userId: rollbackUserId, error: null };
  } catch (error) {
    return { success: false, error, userId: rollbackUserId };
  }
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
    let createdUserId = null;
    try {
      const response = await axios.post(`${adminUrl}/users`, userPayload);
      createdUserUrl = response.headers?.location || null;
      createdUserId = extractUserIdFromLocation(createdUserUrl);
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

    // Step 2: If the role is Platform.Admin, assign and verify the realm role
    if (role === 'admin') {
      try {
        createdUserId = createdUserId || (await resolveNewUserId(axios, adminUrl, email, createdUserUrl, 3, 300));
        if (!createdUserId) {
          throw new Error('Could not resolve newly created user ID for Platform.Admin assignment');
        }

        await assignPlatformAdminRole(axios, adminUrl, createdUserId);
        await verifyPlatformAdminRole(axios, adminUrl, createdUserId);
        console.log(`[Users] ✓ Platform.Admin role assigned to user ${createdUserId}`);
      } catch (roleError) {
        const rollbackResult = await rollbackCreatedUser(axios, adminUrl, createdUserId, email);

        if (rollbackResult.success) {
          const err = new Error(
            'Platform.Admin role assignment failed. The newly created user has been rolled back automatically.'
          );
          err.code = 'ADMIN_ROLE_ASSIGNMENT_FAILED';
          err.email = email;
          err.userId = rollbackResult.userId;
          err.cause = roleError;
          err.response = roleError?.response;
          throw err;
        }

        const err = new Error(
          `Platform.Admin role assignment failed and automatic rollback failed. ` +
            `Please delete the user manually in Keycloak (email: ${email}${
              rollbackResult.userId ? `, id: ${rollbackResult.userId}` : ''
            }).`
        );
        err.code = 'ADMIN_ROLE_ASSIGNMENT_ROLLBACK_FAILED';
        err.email = email;
        err.userId = rollbackResult.userId;
        err.cause = roleError;
        err.rollbackCause = rollbackResult.error;
        err.response = roleError?.response || rollbackResult.error?.response;
        throw err;
      }
    }

    // Step 3: If the role is user, assign the Organization.User realm role
    if (role === 'user') {
      try {
        createdUserId = createdUserId || (await resolveNewUserId(axios, adminUrl, email, createdUserUrl, 3, 300));
        if (!createdUserId) {
          console.warn('[Users] Could not resolve newly created user ID for Organization.User assignment');
        } else {
          await assignOrganizationUserRole(axios, adminUrl, createdUserId);
          console.log(`[Users] ✓ Organization.User role assigned to user ${createdUserId}`);
        }
      } catch (roleError) {
        console.warn('[Users] User created but failed to assign Organization.User role:', roleError.message);
      }
    }

    // Refresh the users list so the new user appears in the table
    await dispatch(fetchRealmUsers());
  };
}
