// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useEffect } from 'react';
import { APP_ROLES } from '../../services/config/accessControl/Roles.js';
import { APP_STATUS } from '../../state/app/constants.js';
import { useFetchInitialData, useAppStatus } from '../../state/app/hooks.js';
import { AUTH_STATUS } from '../../state/auth/constants.js';
import { useAuth, useUserRoles } from '../../state/auth/hooks.js';
import { USERS_STATUS } from '../../state/users/constants.js';
import { useFetchRealmUsers, useUsersListStatus } from '../../state/users/hooks.js';

/**
 * DataLoader component watches for authentication status changes
 * and triggers initial data fetching when user becomes authenticated.
 * After initial data is loaded, it triggers Keycloak user fetching
 * for Platform.Admin users.
 */
export default function DataLoader() {
  const { status } = useAuth();
  const appStatus = useAppStatus();
  const userRoles = useUserRoles();
  const usersStatus = useUsersListStatus();
  const fetchInitialData = useFetchInitialData();
  const fetchRealmUsers = useFetchRealmUsers();

  useEffect(() => {
    if (status === AUTH_STATUS.AUTHENTICATED) {
      console.log('[DataLoader] Auth status changed to AUTHENTICATED, fetching initial data...');
      fetchInitialData();
    }
  }, [status, fetchInitialData]);

  // After initial data (orgs/solutions/workspaces/runners/permissions) is loaded,
  // fetch Keycloak realm users if the current user is a Platform.Admin.
  useEffect(() => {
    if (appStatus === APP_STATUS.SUCCESS && usersStatus === USERS_STATUS.IDLE) {
      const isPlatformAdmin = userRoles?.includes(APP_ROLES.PlatformAdmin);
      if (isPlatformAdmin) {
        console.log('[DataLoader] Platform.Admin detected — fetching realm users...');
        fetchRealmUsers();
      } else {
        console.log('[DataLoader] Non-admin user — skipping realm user fetch.');
      }
    }
  }, [appStatus, usersStatus, userRoles, fetchRealmUsers]);

  // This component doesn't render anything
  return null;
}
