// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { SecurityUtils } from 'src/utils/SecurityUtils.js';

/**
 * Hook to get the current user's permissions on a specific resource.
 * Returns a function: (resourceSecurity, component) => string[]
 *
 * @example
 * const getUserPermissions = useGetUserPermissionsForResource();
 * const permissions = getUserPermissions(organization.security, 'organization');
 */
export const useGetUserPermissionsForResource = () => {
  const userEmail = useSelector((state) => state.auth.userEmail);
  const permissionsMapping = useSelector((state) => state.app.permissionsMapping);

  return useCallback(
    (resourceSecurity, component) => {
      const componentMapping = permissionsMapping?.[component] ?? {};
      return SecurityUtils.getUserPermissionsForResource(resourceSecurity, userEmail, componentMapping);
    },
    [userEmail, permissionsMapping]
  );
};

/**
 * Hook to check if the current user has a specific permission on a resource.
 * Returns a function: (permission, resourceSecurity, component) => boolean
 */
export const useHasPermissionOnResource = () => {
  const getUserPermissions = useGetUserPermissionsForResource();

  return useCallback(
    (permission, resourceSecurity, component) => {
      const permissions = getUserPermissions(resourceSecurity, component);
      return permissions.includes(permission);
    },
    [getUserPermissions]
  );
};

/**
 * Hook that returns the current user's permissions for a specific organization from the Redux store.
 * Reads `currentUserPermissions` from the patched organization object.
 *
 * @param {string} organizationId - The organization ID
 */
export const useUserPermissionsOnOrganization = (organizationId) => {
  return useSelector((state) => {
    const org = state.organizations.list.find((o) => o.id === organizationId);
    return org?.security?.currentUserPermissions ?? [];
  });
};

/**
 * Hook that returns the current user's permissions for a specific workspace from the Redux store.
 * Reads `currentUserPermissions` from the patched workspace object.
 *
 * @param {string} workspaceId - The workspace ID
 */
export const useUserPermissionsOnWorkspace = (workspaceId) => {
  return useSelector((state) => {
    const ws = state.workspaces.list.find((w) => w.id === workspaceId);
    return ws?.security?.currentUserPermissions ?? [];
  });
};

/**
 * Hook combining the user's app-level permissions with resource-level permissions.
 */
export const useUserAppAndResourcePermissions = (resourceSecurity, component) => {
  const appPermissions = useSelector((state) => state.auth.permissions);
  const getUserPermissions = useGetUserPermissionsForResource();

  return useMemo(() => {
    const resourcePermissions = getUserPermissions(resourceSecurity, component);
    return [...new Set([...appPermissions, ...resourcePermissions])];
  }, [appPermissions, getUserPermissions, resourceSecurity, component]);
};
