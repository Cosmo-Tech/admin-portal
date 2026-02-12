// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { SecurityUtils } from './SecurityUtils';

/**
 * Get the user's permissions for a workspace resource.
 */
const _getUserPermissionsForWorkspace = (workspace, userEmail, permissionsMapping) => {
  if (workspace?.security == null || Object.keys(workspace?.security).length === 0) {
    console.warn(`No security data for workspace ${workspace?.id}, restricting access to its content`);
    return [];
  }
  return SecurityUtils.getUserPermissionsForResource(workspace.security, userEmail, permissionsMapping);
};

/**
 * Patch a workspace object with `currentUserPermissions` in its security block.
 */
const patchWorkspaceWithCurrentUserPermissions = (workspace, userEmail, permissionsMapping) => {
  const perms = _getUserPermissionsForWorkspace(workspace, userEmail, permissionsMapping);
  workspace.security = {
    ...workspace.security,
    currentUserPermissions: perms,
  };
  
  // Log the patching result
  const userRole = workspace.security?.accessControlList?.find(
    acl => acl.id.toLowerCase() === userEmail.toLowerCase()
  )?.role || workspace.security?.default || 'none';
  console.log(`[Permissions] Patched ws "${workspace.name || workspace.id}" - role: ${userRole}, permissions: [${perms.join(', ') || 'none'}]`);
};

export const WorkspacesUtils = {
  patchWorkspaceWithCurrentUserPermissions,
};
