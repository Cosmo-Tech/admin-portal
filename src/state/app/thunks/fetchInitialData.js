// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { APP_STATUS } from '../constants.js';
import { setAppStatus } from '../reducers.js';

/**
 * Thunk to fetch all initial data after authentication.
 * Fetches organizations, workspaces, permissions and logs the results.
 */
function fetchInitialData() {
  return async (dispatch, getState, extraArgument) => {
    const { api } = extraArgument;

    dispatch(setAppStatus({ status: APP_STATUS.LOADING }));

    try {
      // Fetch organizations
      console.log('[FetchInitialData] Fetching organizations...');
      const { data: organizations } = await api.Organizations.findAllOrganizations();
      console.log('[FetchInitialData] Organizations fetched:', organizations);

      // Fetch workspaces for each organization
      console.log('[FetchInitialData] Fetching workspaces...');
      const workspacesResults = [];
      for (const org of organizations) {
        try {
          const { data: workspaces } = await api.Workspaces.findAllWorkspaces(org.id);
          workspacesResults.push({ organizationId: org.id, workspaces });
        } catch (error) {
          console.warn(`[FetchInitialData] Could not fetch workspaces for org ${org.id}:`, error.message);
        }
      }
      console.log('[FetchInitialData] Workspaces fetched:', workspacesResults);

      // Log summary
      console.log('[FetchInitialData] ===== INITIAL DATA SUMMARY =====');
      console.log('[FetchInitialData] Total organizations:', organizations.length);
      console.log(
        '[FetchInitialData] Total workspaces:',
        workspacesResults.reduce((acc, r) => acc + r.workspaces.length, 0)
      );
      console.log('[FetchInitialData] ================================');

      dispatch(setAppStatus({ status: APP_STATUS.SUCCESS }));
    } catch (error) {
      console.error('[FetchInitialData] Error fetching initial data:', error);
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
