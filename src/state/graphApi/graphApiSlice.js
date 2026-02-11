// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAppRoleAssignments, getAppRoles, getGroupMembers as fetchGroupMembers } from '../../services/api/graphApiClient';

// Default role ID for "Default Access" (zero GUID) — assignments without a specific role
const DEFAULT_ACCESS_ROLE_ID = '00000000-0000-0000-0000-000000000000';

export const graphApi = createApi({
  reducerPath: 'graphApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['PlatformUsers', 'PlatformGroups', 'GroupMembers'],
  endpoints: (builder) => ({
    /**
     * Fetch all users assigned to the service principal.
     * Resolves appRoleId to human-readable role names.
     * Args: { spObjectId: string }
     */
    getPlatformUsers: builder.query({
      queryFn: async ({ spObjectId }) => {
        try {
          const [assignments, roles] = await Promise.all([
            getAppRoleAssignments(spObjectId),
            getAppRoles(spObjectId),
          ]);

          // Build role lookup: appRoleId -> displayName
          const roleLookup = {};
          roles.forEach((role) => {
            roleLookup[role.id] = role.displayName || role.value || role.id;
          });
          roleLookup[DEFAULT_ACCESS_ROLE_ID] = 'Default Access';

          // Filter to users only and group by principalId to aggregate roles
          const userAssignments = assignments.filter((a) => a.principalType === 'User');

          const userMap = {};
          userAssignments.forEach((a) => {
            if (!userMap[a.principalId]) {
              userMap[a.principalId] = {
                id: a.principalId,
                principalId: a.principalId,
                name: a.principalDisplayName,
                principalType: a.principalType,
                platformRoles: [],
                assignedDate: a.creationTimestamp,
                resourceDisplayName: a.resourceDisplayName,
              };
            }
            const roleName = roleLookup[a.appRoleId] || a.appRoleId;
            if (!userMap[a.principalId].platformRoles.includes(roleName)) {
              userMap[a.principalId].platformRoles.push(roleName);
            }
          });

          return { data: Object.values(userMap) };
        } catch (error) {
          return {
            error: {
              status: error.response?.status || 'FETCH_ERROR',
              message: error.message || 'Failed to fetch platform users.',
              data: error.response?.data,
            },
          };
        }
      },
      providesTags: ['PlatformUsers'],
    }),

    /**
     * Fetch all groups assigned to the service principal.
     * Args: { spObjectId: string }
     */
    getPlatformGroups: builder.query({
      queryFn: async ({ spObjectId }) => {
        try {
          const [assignments, roles] = await Promise.all([
            getAppRoleAssignments(spObjectId),
            getAppRoles(spObjectId),
          ]);

          const roleLookup = {};
          roles.forEach((role) => {
            roleLookup[role.id] = role.displayName || role.value || role.id;
          });
          roleLookup[DEFAULT_ACCESS_ROLE_ID] = 'Default Access';

          const groupAssignments = assignments.filter((a) => a.principalType === 'Group');

          const groupMap = {};
          groupAssignments.forEach((a) => {
            if (!groupMap[a.principalId]) {
              groupMap[a.principalId] = {
                id: a.principalId,
                principalId: a.principalId,
                name: a.principalDisplayName,
                principalType: a.principalType,
                platformRoles: [],
                assignedDate: a.creationTimestamp,
                resourceDisplayName: a.resourceDisplayName,
              };
            }
            const roleName = roleLookup[a.appRoleId] || a.appRoleId;
            if (!groupMap[a.principalId].platformRoles.includes(roleName)) {
              groupMap[a.principalId].platformRoles.push(roleName);
            }
          });

          return { data: Object.values(groupMap) };
        } catch (error) {
          return {
            error: {
              status: error.response?.status || 'FETCH_ERROR',
              message: error.message || 'Failed to fetch platform groups.',
              data: error.response?.data,
            },
          };
        }
      },
      providesTags: ['PlatformGroups'],
    }),

    /**
     * Fetch members of a specific group.
     * Args: { groupId: string }
     */
    getGroupMembers: builder.query({
      queryFn: async ({ groupId }) => {
        try {
          const members = await fetchGroupMembers(groupId);
          const normalized = members.map((m) => ({
            id: m.objectId,
            name: m.displayName,
            email: m.mail || m.userPrincipalName || '',
            type: m.objectType,
          }));
          return { data: normalized };
        } catch (error) {
          return {
            error: {
              status: error.response?.status || 'FETCH_ERROR',
              message: error.message || 'Failed to fetch group members.',
              data: error.response?.data,
            },
          };
        }
      },
      providesTags: (result, error, { groupId }) => [{ type: 'GroupMembers', id: groupId }],
    }),
  }),
});

export const {
  useGetPlatformUsersQuery,
  useGetPlatformGroupsQuery,
  useGetGroupMembersQuery,
} = graphApi;
