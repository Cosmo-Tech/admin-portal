// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { ACL_ROLES } from 'src/services/config/accessControl';
import { SecurityUtils } from './SecurityUtils';

/**
 * Get the user's permissions for a dataset resource.
 * If the dataset has no security data, grants admin-level permissions as fallback.
 */
const _getUserPermissionsForDataset = (dataset, userEmail, permissionsMapping) => {
  if (dataset?.security == null) {
    return SecurityUtils.getPermissionsFromRole(ACL_ROLES.DATASET.ADMIN, permissionsMapping);
  }
  return SecurityUtils.getUserPermissionsForResource(dataset.security, userEmail, permissionsMapping);
};

/**
 * Patch a dataset object with `currentUserPermissions` in its security block.
 */
const patchDatasetWithCurrentUserPermissions = (dataset, userEmail, permissionsMapping) => {
  if (dataset == null) return;
  const perms = _getUserPermissionsForDataset(dataset, userEmail, permissionsMapping);
  dataset.security = {
    ...dataset.security,
    currentUserPermissions: perms,
  };
  
  // Log the patching result
  const userRole = dataset.security?.accessControlList?.find(
    acl => acl.id.toLowerCase() === userEmail.toLowerCase()
  )?.role || dataset.security?.default || 'admin';
  console.log(`[Permissions] Patched dataset "${dataset.name || dataset.id}" - role: ${userRole}, permissions: [${perms.join(', ')}]`);
};

export const DatasetsUtils = {
  patchDatasetWithCurrentUserPermissions,
};
