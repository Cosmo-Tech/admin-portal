// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { SecurityUtils } from './SecurityUtils';

/**
 * Get the user's permissions for a runner resource.
 */
const _getUserPermissionsForRunner = (runner, userEmail, permissionsMapping) => {
  if (runner?.security == null || Object.keys(runner?.security).length === 0) {
    console.warn(`No security data for runner ${runner?.id}, restricting access to its content`);
    return [];
  }
  return SecurityUtils.getUserPermissionsForResource(runner.security, userEmail, permissionsMapping);
};

/**
 * Patch a runner object with `currentUserPermissions` in its security block.
 */
const patchRunnerWithCurrentUserPermissions = (runner, userEmail, permissionsMapping) => {
  const perms = _getUserPermissionsForRunner(runner, userEmail, permissionsMapping);
  runner.security = {
    ...runner.security,
    currentUserPermissions: perms,
  };
};

export const RunnersUtils = {
  patchRunnerWithCurrentUserPermissions,
};
