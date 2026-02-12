// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { SecurityUtils } from './SecurityUtils';

/**
 * Get the user's permissions for an organization resource.
 */
const _getUserPermissionsForOrganization = (organization, userEmail, permissionsMapping) => {
  if (organization?.security == null || Object.keys(organization?.security).length === 0) {
    console.warn(`No security data for organization ${organization?.id}, restricting access to its content`);
    return [];
  }
  return SecurityUtils.getUserPermissionsForResource(organization.security, userEmail, permissionsMapping);
};

/**
 * Patch an organization object with `currentUserPermissions` in its security block.
 */
const patchOrganizationWithCurrentUserPermissions = (organization, userEmail, permissionsMapping) => {
  const perms = _getUserPermissionsForOrganization(organization, userEmail, permissionsMapping);
  organization.security = {
    ...organization.security,
    currentUserPermissions: perms,
  };
  
  // Log the patching result
  const userRole = organization.security?.accessControlList?.find(
    acl => acl.id.toLowerCase() === userEmail.toLowerCase()
  )?.role || organization.security?.default || 'none';
  console.log(`[Permissions] Patched org "${organization.name || organization.id}" - role: ${userRole}, permissions: [${perms.join(', ') || 'none'}]`);
};

export const OrganizationsUtils = {
  patchOrganizationWithCurrentUserPermissions,
};
