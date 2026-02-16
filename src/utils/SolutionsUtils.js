// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { SecurityUtils } from './SecurityUtils';

/**
 * Get the user's permissions for a solution resource.
 */
const _getUserPermissionsForSolution = (solution, userEmail, permissionsMapping) => {
  if (solution?.security == null || Object.keys(solution?.security).length === 0) {
    console.warn(`No security data for solution ${solution?.id}, restricting access to its content`);
    return [];
  }
  return SecurityUtils.getUserPermissionsForResource(solution.security, userEmail, permissionsMapping);
};

/**
 * Patch a solution object with `currentUserPermissions` in its security block.
 */
const patchSolutionWithCurrentUserPermissions = (solution, userEmail, permissionsMapping) => {
  const perms = _getUserPermissionsForSolution(solution, userEmail, permissionsMapping);
  solution.security = {
    ...solution.security,
    currentUserPermissions: perms,
  };

  const userRole =
    solution.security?.accessControlList?.find((acl) => acl.id.toLowerCase() === userEmail.toLowerCase())?.role ||
    solution.security?.default ||
    'none';
  console.log(
    `[Permissions] Patched solution "${solution.name || solution.id}" - role: ${userRole}, permissions: [${perms.join(', ') || 'none'}]`
  );
};

export const SolutionsUtils = {
  patchSolutionWithCurrentUserPermissions,
};
