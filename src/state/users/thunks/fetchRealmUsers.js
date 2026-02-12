// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { getAxiosInstance, deriveKeycloakAdminUrl } from 'src/services/api/apiClient.js';
import { apiManager } from 'src/services/api/apiManager.js';
import { APP_ROLES } from 'src/services/config/accessControl/Roles.js';
import { SecurityUtils } from 'src/utils/SecurityUtils.js';
import { USERS_STATUS } from '../constants.js';
import { setUsers, setUsersStatus, setLastLoginMap, setUserPermissions, setUserRealmRoles } from '../reducers.js';

/**
 * Thunk to fetch all Keycloak realm users, their login events, realm roles,
 * and compute per-user resource permissions from existing ACLs in Redux.
 *
 * Sequence:
 *  1. Fetch all users from Keycloak Admin API
 *  2. Fetch LOGIN events (for last-login timestamps)
 *  3. Fetch realm role-mappings per user (to detect Platform.Admin)
 *  4. Compute per-user permissions from organizations/workspaces/runners ACLs
 */
function fetchRealmUsers() {
  return async (dispatch, getState) => {
    dispatch(setUsersStatus({ status: USERS_STATUS.LOADING }));

    const apiConfig = apiManager.getApi();
    const realmUrl = apiConfig?.AUTH_KEYCLOAK_REALM;
    if (!realmUrl) {
      console.warn('[Users] No Keycloak realm configured — skipping user fetch.');
      dispatch(setUsersStatus({ status: USERS_STATUS.ERROR, error: 'Keycloak realm not configured' }));
      return;
    }

    const adminUrl = deriveKeycloakAdminUrl(realmUrl);
    const axios = getAxiosInstance();

    try {
      // ── Step 1: Fetch all realm users ──────────────────────────────────
      console.log('[Users] 1️⃣  Fetching realm users from Keycloak...');
      let keycloakUsers = [];
      try {
        const { data } = await axios.get(`${adminUrl}/users`, { params: { max: 500 } });
        keycloakUsers = data;
        console.log(`[Users]     ✓ Fetched ${keycloakUsers.length} user(s)`);
      } catch (usersError) {
        const status = usersError.response?.status;
        if (status === 403) {
          console.error(
            '[Users] ❌ 403 Forbidden: Current token lacks Admin API permissions.\n' +
              '[Users]    Configure Keycloak:\n' +
              '[Users]    → Realm Roles → Platform.Admin → Associated Roles\n' +
              '[Users]    → Add: realm-management:view-users and realm-management:view-events'
          );
          dispatch(
            setUsersStatus({
              status: USERS_STATUS.ERROR,
              error:
                'Admin API access denied. Platform.Admin role needs realm-management:view-users permission in Keycloak.',
            })
          );
          return;
        }
        console.error('[Users]     ⚠️  Failed to fetch realm users:', usersError.message);
        throw usersError;
      }

      dispatch(setUsers({ users: keycloakUsers }));

      // ── Step 2: Fetch login events (best-effort) ──────────────────────
      console.log('[Users] 2️⃣  Fetching login events...');
      const lastLoginMap = {};
      try {
        const { data: events } = await axios.get(`${adminUrl}/events`, {
          params: { type: 'LOGIN', max: 1000 },
        });
        for (const event of events) {
          if (!lastLoginMap[event.userId] || event.time > lastLoginMap[event.userId]) {
            lastLoginMap[event.userId] = event.time;
          }
        }
        console.log(`[Users]     ✓ Resolved last-login for ${Object.keys(lastLoginMap).length} user(s)`);
      } catch (eventsError) {
        console.warn('[Users]     ⚠️  Could not fetch login events (may lack view-events role):', eventsError.message);
      }
      dispatch(setLastLoginMap({ lastLoginMap }));

      // ── Step 3: Fetch realm roles per user ─────────────────────────────
      console.log('[Users] 3️⃣  Fetching realm roles for each user...');
      const rolesByUserId = {};
      const rolePromises = keycloakUsers.map(async (user) => {
        try {
          const { data: roles } = await axios.get(`${adminUrl}/users/${user.id}/role-mappings/realm`);
          const roleNames = roles.map((r) => r.name);
          const isPlatformAdmin = roleNames.some(
            (name) => name === APP_ROLES.PlatformAdmin || name.toLowerCase() === 'platform.admin'
          );
          rolesByUserId[user.id] = { realmRoles: roleNames, isPlatformAdmin };
        } catch (roleError) {
          console.warn(`[Users]     ⚠️  Could not fetch roles for user ${user.username}:`, roleError.message);
          rolesByUserId[user.id] = { realmRoles: [], isPlatformAdmin: false };
        }
      });
      await Promise.all(rolePromises);
      dispatch(setUserRealmRoles({ rolesByUserId }));
      console.log('[Users]     ✓ Realm roles resolved');

      // ── Step 4: Compute per-user resource permissions ──────────────────
      console.log('[Users] 4️⃣  Computing per-user resource permissions...');
      const state = getState();
      const organizations = state.organizations.list ?? [];
      const workspaces = state.workspaces.list ?? [];
      const runners = state.runners.list ?? [];
      const permissionsMapping = state.app.permissionsMapping ?? {};

      const orgMapping = permissionsMapping.organization ?? {};
      const wsMapping = permissionsMapping.workspace ?? {};
      const runnerMapping = permissionsMapping.runner ?? {};

      const permissionsByUserId = {};

      for (const user of keycloakUsers) {
        const userEmail = user.email;
        if (!userEmail) continue;

        const userOrgPerms = {};
        for (const org of organizations) {
          if (org.security) {
            const role = SecurityUtils.getUserRoleForResource(org.security, userEmail);
            const permissions = SecurityUtils.getUserPermissionsForResource(org.security, userEmail, orgMapping);
            userOrgPerms[org.id] = { role: role ?? 'none', permissions, name: org.name };
          }
        }

        const userWsPerms = {};
        for (const ws of workspaces) {
          if (ws.security) {
            const role = SecurityUtils.getUserRoleForResource(ws.security, userEmail);
            const permissions = SecurityUtils.getUserPermissionsForResource(ws.security, userEmail, wsMapping);
            userWsPerms[ws.id] = { role: role ?? 'none', permissions, name: ws.name };
          }
        }

        const userRunnerPerms = {};
        for (const runner of runners) {
          if (runner.security) {
            const role = SecurityUtils.getUserRoleForResource(runner.security, userEmail);
            const permissions = SecurityUtils.getUserPermissionsForResource(runner.security, userEmail, runnerMapping);
            userRunnerPerms[runner.id] = { role: role ?? 'none', permissions, name: runner.name };
          }
        }

        permissionsByUserId[user.id] = {
          organizations: userOrgPerms,
          workspaces: userWsPerms,
          runners: userRunnerPerms,
        };
      }

      dispatch(setUserPermissions({ permissionsByUserId }));
      console.log('[Users]     ✓ Per-user permissions computed');

      // ── Done ───────────────────────────────────────────────────────────
      dispatch(setUsersStatus({ status: USERS_STATUS.SUCCESS }));
      console.log('[Users] ✅ Users workflow complete');
    } catch (error) {
      console.error('[Users] ❌ Error fetching realm users:', error);
      dispatch(
        setUsersStatus({
          status: USERS_STATUS.ERROR,
          error: error.message || 'Failed to fetch realm users',
        })
      );
    }
  };
}

export default fetchRealmUsers;
