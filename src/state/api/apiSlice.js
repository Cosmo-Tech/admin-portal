// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAxiosInstance, deriveKeycloakAdminUrl } from 'src/services/api/apiClient.js';
import { apiManager } from 'src/services/api/apiManager.js';

/**
 * Get the Keycloak Admin API base URL from the currently selected API config.
 * Returns null if the current API is not Keycloak or has no realm configured.
 */
const getKeycloakAdminBaseUrl = () => {
  const api = apiManager.getApi();
  if (!api?.AUTH_KEYCLOAK_REALM) return null;
  return deriveKeycloakAdminUrl(api.AUTH_KEYCLOAK_REALM);
};

export const cosmoApi = createApi({
  reducerPath: 'cosmoApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getAllSolutions: builder.query({
      queryFn: async (args, thunkAPI) => {
        const { api } = thunkAPI.extra;
        try {
          const { data } = await api.Solutions.findAllSolutions('o-vloxvdke5gqvx');
          return { data };
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
    }),
    getAllScenarios: builder.query({
      queryFn: async (args, thunkAPI) => {
        const { api } = thunkAPI.extra;
        try {
          const { data } = await api.Runners.listRunners('o-vloxvdke5gqvx', 'w-314qryelkyop5', 0, 5000);
          const scenarios = data.filter((runner) => runner.ownerId === 'c12fe835-b8b0-4578-9343-dddeaecd0140');
          return { data: scenarios };
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
    }),
    renameScenario: builder.mutation({
      queryFn: async (args, thunkAPI) => {
        const { api } = thunkAPI.extra;
        const { runnerId, patch } = args;
        try {
          const { data } = await api.Runners.updateRunner('o-vloxvdke5gqvx', 'w-314qryelkyop5', runnerId, patch);
          return { data };
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            cosmoApi.util.updateQueryData('getAllScenarios', undefined, (draft) => {
              const index = draft.findIndex((scenario) => scenario.id === data.id);
              draft[index] = data;
            })
          );
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
    }),

    // ──────────────────────────────────────────────
    // Keycloak Admin API endpoints
    // ──────────────────────────────────────────────

    /**
     * Fetch all users from the Keycloak realm.
     * GET /admin/realms/{realm}/users?max=500
     */
    getRealmUsers: builder.query({
      queryFn: async () => {
        const adminUrl = getKeycloakAdminBaseUrl();
        if (!adminUrl) return { error: { message: 'Keycloak Admin URL not available' } };
        const axios = getAxiosInstance();
        try {
          const { data } = await axios.get(`${adminUrl}/users`, { params: { max: 500 } });
          return { data };
        } catch (error) {
          console.error('[Keycloak Admin] Failed to fetch realm users:', error);
          return { error: { message: error.message, status: error.response?.status } };
        }
      },
    }),

    /**
     * Fetch LOGIN events from the Keycloak realm to derive last-login timestamps.
     * GET /admin/realms/{realm}/events?type=LOGIN
     * Returns a Map-like object: { [userId]: lastLoginTimestamp }
     */
    getUserLoginEvents: builder.query({
      queryFn: async () => {
        const adminUrl = getKeycloakAdminBaseUrl();
        if (!adminUrl) return { error: { message: 'Keycloak Admin URL not available' } };
        const axios = getAxiosInstance();
        try {
          const { data: events } = await axios.get(`${adminUrl}/events`, {
            params: { type: 'LOGIN', max: 1000 },
          });
          // Build a map of userId → most recent login timestamp
          const lastLoginMap = {};
          for (const event of events) {
            if (!lastLoginMap[event.userId] || event.time > lastLoginMap[event.userId]) {
              lastLoginMap[event.userId] = event.time;
            }
          }
          return { data: lastLoginMap };
        } catch (error) {
          console.error('[Keycloak Admin] Failed to fetch login events:', error);
          // Non-fatal: events may not be available (retention, permissions)
          return { data: {} };
        }
      },
    }),

    /**
     * Fetch realm role-mappings for a specific user.
     * GET /admin/realms/{realm}/users/{userId}/role-mappings/realm
     */
    getUserRealmRoles: builder.query({
      queryFn: async (userId) => {
        const adminUrl = getKeycloakAdminBaseUrl();
        if (!adminUrl) return { error: { message: 'Keycloak Admin URL not available' } };
        const axios = getAxiosInstance();
        try {
          const { data } = await axios.get(`${adminUrl}/users/${userId}/role-mappings/realm`);
          return { data };
        } catch (error) {
          console.error(`[Keycloak Admin] Failed to fetch roles for user ${userId}:`, error);
          return { error: { message: error.message, status: error.response?.status } };
        }
      },
    }),
  }),
});

export const {
  useGetAllSolutionsQuery,
  useGetAllScenariosQuery,
  useRenameScenarioMutation,
  useGetRealmUsersQuery,
  useGetUserLoginEventsQuery,
  useGetUserRealmRolesQuery,
} = cosmoApi;
