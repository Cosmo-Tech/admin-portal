// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { OrganizationsUtils } from 'src/utils/OrganizationsUtils.js';
import { WorkspacesUtils } from 'src/utils/WorkspacesUtils.js';
import { RunnersUtils } from 'src/utils/RunnersUtils.js';
import { setOrganizations } from '../../organizations/reducers.js';
import { setWorkspaces } from '../../workspaces/reducers.js';
import { setRunners } from '../../runners/reducers.js';
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
      
      console.log('[Permissions] ========== LOADING PERMISSIONS & RESOURCES ==========');
      console.log('[Permissions] User:', userName, `(${userEmail})`);
      console.log('[Permissions] ================================================================');
      
      // Step 1: Fetch permissions mapping via v5 API (fallback to v3)
      console.log('[Permissions] 1️⃣  Fetching permissions mapping from API...');
      let organizationPermissions;
      try {
        const { data } = await api.OrganizationsV5.listPermissions();
        organizationPermissions = data;
        console.log('[Permissions]     ✓ Using v5 API');
      } catch (v5Error) {
        console.warn('[Permissions]     v5 failed, trying v3...');
        const { data } = await api.Organizations.getAllPermissions();
        organizationPermissions = data;
        console.log('[Permissions]     ✓ Using v3 API (fallback)');
      }
      
      // Log the permissions mapping structure
      console.log('[Permissions] Role → Permission Mapping:');
      organizationPermissions.forEach(({ component, roles }) => {
        console.log(`    📦 ${component}:`);
        Object.entries(roles).forEach(([role, perms]) => {
          console.log(`       └─ ${role}: [${perms.join(', ')}]`);
        });
      });
      
      dispatch(setPermissionsMapping({ organizationPermissions }));
      console.log('[Permissions] ✓ Permissions mapping stored in Redux');

      // Get user's current email and the permissions mapping
      const permissionsMapping = getState().app.permissionsMapping;

      // Step 2: Fetch organizations and patch with currentUserPermissions
      console.log('[Permissions] 2️⃣  Fetching organizations...');
      const { data: organizations } = await api.Organizations.findAllOrganizations();
      const orgPermissionsMapping = permissionsMapping.organization ?? {};
      
      for (const org of organizations) {
        OrganizationsUtils.patchOrganizationWithCurrentUserPermissions(org, userEmail, orgPermissionsMapping);
      }
      dispatch(setOrganizations({ organizations }));
      
      console.log(`[Permissions] ✓ Loaded ${organizations.length} organization(s)`);
      organizations.forEach((org) => {
        const userPermissions = org.security?.currentUserPermissions ?? [];
        const userRole = org.security?.accessControlList?.find(acl => acl.id.toLowerCase() === userEmail.toLowerCase())?.role || org.security?.default || 'none';
        console.log(`    📁 "${org.name}"`);
        console.log(`       └─ Role: ${userRole}`);
        console.log(`       └─ Permissions: [${userPermissions.join(', ') || 'none'}]`);
      });

      // Step 3: Fetch workspaces for each organization and patch with currentUserPermissions
      console.log('[Permissions] 3️⃣  Fetching workspaces...');
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
          console.warn(`[Permissions]   ⚠️  Could not fetch workspaces for org "${org.name}":`, error.message);
        }
      }
      dispatch(setWorkspaces({ workspaces: allWorkspaces }));
      
      console.log(`[Permissions] ✓ Loaded ${allWorkspaces.length} workspace(s)`);
      allWorkspaces.forEach((ws) => {
        const userPermissions = ws.security?.currentUserPermissions ?? [];
        const userRole = ws.security?.accessControlList?.find(acl => acl.id.toLowerCase() === userEmail.toLowerCase())?.role || ws.security?.default || 'none';
        console.log(`    📂 "${ws.name}" (in org ${ws.organizationId})`);
        console.log(`       └─ Role: ${userRole}`);
        console.log(`       └─ Permissions: [${userPermissions.join(', ') || 'none'}]`);
      });

      // Step 4: Fetch runners for each workspace and patch with currentUserPermissions
      console.log('[Permissions] 4️⃣  Fetching runners...');
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
            console.warn(`[Permissions]   ⚠️  Could not fetch runners for workspace "${ws.name}":`, error.message);
          }
        }
      }
      dispatch(setRunners({ runners: allRunners }));
      
      console.log(`[Permissions] ✓ Loaded ${allRunners.length} runner(s)`);
      allRunners.forEach((runner) => {
        const userPermissions = runner.security?.currentUserPermissions ?? [];
        const userRole = runner.security?.accessControlList?.find(acl => acl.id.toLowerCase() === userEmail.toLowerCase())?.role || runner.security?.default || 'none';
        console.log(`    🎯 "${runner.name}" (in workspace ${runner.workspaceId})`);
        console.log(`       └─ Role: ${userRole}`);
        console.log(`       └─ Permissions: [${userPermissions.join(', ') || 'none'}]`);
      });

      // Log final summary
      console.log('[Permissions] ================================================================');
      console.log('[Permissions] 📊 SUMMARY:');
      console.log(`[Permissions]    • User: ${userName}`);
      console.log(`[Permissions]    • Organizations: ${organizations.length}`);
      console.log(`[Permissions]    • Workspaces: ${allWorkspaces.length}`);
      console.log(`[Permissions]    • Runners: ${allRunners.length}`);
      console.log(`[Permissions]    • Permission Components: ${Object.keys(permissionsMapping).join(', ')}`);
      console.log('[Permissions] ✅ PERMISSIONS WORKFLOW COMPLETE');
      console.log('[Permissions] ================================================================');

      dispatch(setAppStatus({ status: APP_STATUS.SUCCESS }));
    } catch (error) {
      console.error('[Permissions] ❌ Error:', error);
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
