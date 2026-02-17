// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { getAxiosInstance, deriveKeycloakAdminUrl } from 'src/services/api/apiClient.js';
import { apiManager } from 'src/services/api/apiManager.js';
import fetchRealmUsers from './fetchRealmUsers.js';

/**
 * Delete a Keycloak user by their ID.
 *
 * Keycloak Admin REST API: DELETE /admin/realms/{realm}/users/{userId}
 * @see https://www.keycloak.org/docs-api/latest/rest-api/index.html#_users
 *
 * @param {string} userId - The Keycloak user ID to delete
 * @returns {Function} Redux thunk
 */
export default function deleteKeycloakUser(userId) {
  return async (dispatch) => {
    const apiConfig = apiManager.getApi();
    const realmUrl = apiConfig?.AUTH_KEYCLOAK_REALM;
    if (!realmUrl) {
      throw new Error('Keycloak realm not configured');
    }

    const adminUrl = deriveKeycloakAdminUrl(realmUrl);
    const axios = getAxiosInstance();

    try {
      await axios.delete(`${adminUrl}/users/${userId}`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 403) {
        const err = new Error(
          'Admin API access denied (403 Forbidden). ' +
            'The Platform.Admin role needs the realm-management:manage-users permission in Keycloak.'
        );
        err.response = error.response;
        throw err;
      }
      if (status === 404) {
        const err = new Error('User not found. They may have already been deleted.');
        err.response = error.response;
        throw err;
      }
      throw error;
    }

    // Refresh the users list
    await dispatch(fetchRealmUsers());
  };
}
