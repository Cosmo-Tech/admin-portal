// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { OrganizationsUtils } from 'src/utils/OrganizationsUtils.js';
import { RunnersUtils } from 'src/utils/RunnersUtils.js';
import { WorkspacesUtils } from 'src/utils/WorkspacesUtils.js';
import { setOrganizations } from '../../organizations/reducers.js';
import { setRunners } from '../../runners/reducers.js';
import { setWorkspaces } from '../../workspaces/reducers.js';
import { APP_STATUS } from '../constants.js';
import { setAppStatus, setPermissionsMapping } from '../reducers.js';

/**
 * Thunk to fetch all initial data after authentication.
 * 1. Fetches the organization permissions mapping (roles → permissions per component).
 * 2. Fetches organizations, workspaces, and runners.
 * 3. Patches each resource with `currentUserPermissions` for the logged-in user.
 */
function fetchInitialData() {
  return async (dispatch, getState, extraArgument) => {
    const { api } = extraArgument;

    dispatch(setAppStatus({ status: APP_STATUS.LOADING }));

    try {
      const userEmail = getState().auth.userEmail;
      const userName = getState().auth.userName;

      console.log('[Permissions] Loading permissions & resources for', userName);

      // Step 1: Fetch permissions mapping via v5 API (fallback to v3)
      let organizationPermissions;
      try {
        const { data } = await api.OrganizationsV5.listPermissions();
        organizationPermissions = data;
      } catch (v5Error) {
        const { data } = await api.Organizations.getAllPermissions();
        organizationPermissions = data;
      }

      dispatch(setPermissionsMapping({ organizationPermissions }));

      // Get user's current email and the permissions mapping
      const permissionsMapping = getState().app.permissionsMapping;

      // Step 2: Fetch organizations and patch with currentUserPermissions
      const { data: organizations } = await api.Organizations.findAllOrganizations();
      const orgPermissionsMapping = permissionsMapping.organization ?? {};

      for (const org of organizations) {
        OrganizationsUtils.patchOrganizationWithCurrentUserPermissions(org, userEmail, orgPermissionsMapping);
      }
      dispatch(setOrganizations({ organizations }));
      console.log('[Permissions] ✓ Loaded', organizations.length, 'organization(s)');

      // Step 3: Fetch workspaces for each organization and patch with currentUserPermissions
      const allWorkspaces = [];
      const wsPermissionsMapping = permissionsMapping.workspace ?? {};

      for (const org of organizations) {
        try {
          const { data: workspaces } = await api.Workspaces.findAllWorkspaces(org.id);
          for (const ws of workspaces) {
            WorkspacesUtils.patchWorkspaceWithCurrentUserPermissions(ws, userEmail, wsPermissionsMapping);
          }
          allWorkspaces.push(...workspaces.map((ws) => ({ ...ws, organizationId: org.id })));
        } catch (error) {
          console.warn(`[Permissions] Could not fetch workspaces for org "${org.name}":`, error.message);
        }
      }
      dispatch(setWorkspaces({ workspaces: allWorkspaces }));
      console.log('[Permissions] ✓ Loaded', allWorkspaces.length, 'workspace(s)');

      // Step 4: Fetch runners for each workspace and patch with currentUserPermissions
      const allRunners = [];
      const runnerPermissionsMapping = permissionsMapping.runner ?? {};

      for (const org of organizations) {
        for (const ws of allWorkspaces.filter((w) => w.organizationId === org.id)) {
          try {
            const { data: runners } = await api.Runners.listRunners(org.id, ws.id);
            for (const runner of runners) {
              RunnersUtils.patchRunnerWithCurrentUserPermissions(runner, userEmail, runnerPermissionsMapping);
            }
            allRunners.push(...runners.map((runner) => ({ ...runner, workspaceId: ws.id, organizationId: org.id })));
          } catch (error) {
            console.warn(`[Permissions] Could not fetch runners for workspace "${ws.name}":`, error.message);
          }
        }
      }
      dispatch(setRunners({ runners: allRunners }));
      console.log('[Permissions] ✓ Loaded', allRunners.length, 'runner(s)');

      console.log('[Permissions] ✅ Initial data loading complete');
      dispatch(setAppStatus({ status: APP_STATUS.SUCCESS }));
    } catch (error) {
      console.error('[Permissions] ❌ Error:', error.message);
      dispatch(
        setAppStatus({
          status: APP_STATUS.ERROR,
          error: error.message || 'Failed to fetch initial data',
        })
      );
    }
  };
}

export default fetchInitialData;
