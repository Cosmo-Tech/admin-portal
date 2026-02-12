// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { ACL_ROLES } from 'src/services/config/accessControl';

const _findById = (array, idToFind) => {
  return array.find((element) => element.id === idToFind);
};

/**
 * Compare two ACLs and return whether they are identical.
 */
const areAccessControlListsIdentical = (aclA = [], aclB = []) => {
  if (Object.keys(aclA).length !== Object.keys(aclB).length) return false;
  for (const userAccessA of aclA) {
    const userAccessB = _findById(aclB, userAccessA.id);
    if (userAccessB === undefined || userAccessA.role !== userAccessB.role) return false;
  }
  return true;
};

/**
 * Compare two ACLs and return the diff: users to add, modify, and remove.
 */
const compareAccessControlLists = (currentACL, newACL) => {
  const usersToAdd = [];
  const usersToModify = [];
  const usersToRemove = [];

  for (const newACLUser of newACL) {
    const currentACLUser = _findById(currentACL, newACLUser.id);
    if (currentACLUser === undefined) {
      usersToAdd.push(newACLUser);
    } else if (currentACLUser.role !== newACLUser.role) {
      usersToModify.push(newACLUser);
    }
  }

  for (const currentACLUser of currentACL) {
    const newACLUser = _findById(newACL, currentACLUser.id);
    if (newACLUser === undefined) {
      usersToRemove.push(currentACLUser);
    }
  }

  return { usersToAdd, usersToModify, usersToRemove };
};

/**
 * Extract user IDs from an ACL array.
 */
const getUsersIdsFromACL = (acl) => {
  return acl.map((aclUser) => aclUser.id);
};

/**
 * Update a resource's security by comparing old security to new and calling the appropriate callbacks.
 */
const updateResourceSecurity = async (
  currentSecurity,
  newSecurity,
  setDefaultSecurity,
  addAccess,
  updateAccess,
  removeAccess
) => {
  let hasChanges = false;

  if (currentSecurity?.default !== newSecurity?.default) {
    await setDefaultSecurity(newSecurity.default);
    hasChanges = true;
  }

  const { usersToAdd, usersToModify, usersToRemove } = compareAccessControlLists(
    currentSecurity?.accessControlList ?? [],
    newSecurity?.accessControlList ?? []
  );

  // Sort so that admins are added first (to prevent removing the last admin)
  sortByNewAdminsFirst(usersToAdd);

  for (const userToAdd of usersToAdd) {
    await addAccess(userToAdd);
    hasChanges = true;
  }
  for (const userToModify of usersToModify) {
    await updateAccess(userToModify.id, { role: userToModify.role });
    hasChanges = true;
  }
  for (const userToRemove of usersToRemove) {
    await removeAccess(userToRemove.id);
    hasChanges = true;
  }

  return hasChanges;
};

/**
 * Sort an ACL in-place so that admin entries appear first.
 */
const sortByNewAdminsFirst = (acl) => {
  acl.sort((a, b) => {
    const aIsAdmin = a.role === ACL_ROLES.ORGANIZATION.ADMIN;
    const bIsAdmin = b.role === ACL_ROLES.ORGANIZATION.ADMIN;
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    return 0;
  });
};

/**
 * Transpose a roles-to-permissions mapping dict into a permissions-to-roles dict.
 * Input: { admin: ['read', 'write'], viewer: ['read'] }
 * Output: { read: ['admin', 'viewer'], write: ['admin'] }
 */
const transposeMappingDict = (mappingDict) => {
  if (mappingDict == null) {
    console.warn("Mapping dict is null or undefined, can't transpose it.");
    return {};
  }
  const newDict = {};
  for (const [role, permissions] of Object.entries(mappingDict)) {
    for (const permission of permissions) {
      if (newDict[permission] == null) newDict[permission] = [];
      newDict[permission].push(role);
    }
  }
  return newDict;
};

/**
 * Get the list of permissions for a given role using a roles-to-permissions mapping.
 */
const getPermissionsFromRole = (role, rolesToPermissionsMapping) => {
  if (role == null) {
    console.warn("Role is null or undefined, can't retrieve permissions.");
    return [];
  }
  if (rolesToPermissionsMapping == null) {
    console.warn("Mapping between roles and permissions is null or undefined, can't retrieve permissions.");
    return [];
  }
  return rolesToPermissionsMapping[typeof role === 'string' ? role.toLowerCase() : role] ?? [];
};

/**
 * Given a permission name and a roles-to-permissions mapping, return the list of roles granting this permission.
 */
const getRolesGrantingPermission = (permission, rolesToPermissionsMapping) => {
  if (permission == null) {
    console.warn("Permission is null or undefined, can't retrieve associated roles.");
    return [];
  }
  if (rolesToPermissionsMapping == null) {
    console.warn(
      "Mapping between roles and permissions is null or undefined, can't retrieve roles granting permission."
    );
    return [];
  }
  const permissionsToRoleDict = transposeMappingDict(rolesToPermissionsMapping);
  const rolesGrantingPermission = permissionsToRoleDict[permission];
  if (rolesGrantingPermission == null) {
    console.warn(`Permission ${permission} not found in mapping. Can't find roles granting this permission.`);
    return [];
  }
  return rolesGrantingPermission;
};

/**
 * Get the role of a user for a specific resource based on that resource's security object.
 * Checks the ACL first; falls back to the resource's default role.
 */
const getUserRoleForResource = (resourceSecurity, userIdentifier) => {
  if (resourceSecurity == null) {
    console.warn("Resource security is null or undefined, can't retrieve user role for resource.");
    return null;
  }
  if (userIdentifier == null) {
    console.warn("User identifier is null or undefined, can't get user role for resource.");
    return null;
  }
  // Check specific permissions by access control list
  if (resourceSecurity.accessControlList != null) {
    const acl = resourceSecurity.accessControlList;
    if (Array.isArray(acl)) {
      const specificUserSecurity = acl.find((aclUser) => aclUser.id.toLowerCase() === userIdentifier.toLowerCase());
      if (specificUserSecurity !== undefined) {
        return specificUserSecurity.role;
      }
    }
  }
  // If user is not specifically in ACL, return the default role of the resource
  return resourceSecurity.default ?? null;
};

/**
 * Get the permissions of a user for a specific resource, by resolving their role and looking up
 * the role-to-permissions mapping.
 */
const getUserPermissionsForResource = (resourceSecurity, userIdentifier, resourceRolesToPermissionsMapping) => {
  if (resourceSecurity == null) {
    console.warn("Resource security is null or undefined, can't retrieve user permissions.");
    return [];
  }
  if (Object.keys(resourceSecurity).length === 0) {
    console.warn("Resource security is an empty object, can't retrieve user permissions.");
    return [];
  }
  if (resourceRolesToPermissionsMapping == null) {
    console.warn("Mapping between roles and permissions is null or undefined, can't retrieve user permissions.");
    return [];
  }
  const userRoleForResource = getUserRoleForResource(resourceSecurity, userIdentifier);
  if (userRoleForResource === null) return [];
  return getPermissionsFromRole(userRoleForResource, resourceRolesToPermissionsMapping);
};

/**
 * Extract unique roles from a permissions mapping.
 */
const _getRolesFromMapping = (permissionsMapping) => {
  return Object.keys(permissionsMapping);
};

/**
 * Extract unique permissions from a permissions mapping.
 */
const _getPermissionsFromMapping = (permissionsMapping) => {
  const permissionsSet = new Set();
  Object.values(permissionsMapping).forEach((permissions) =>
    permissions.forEach((permission) => permissionsSet.add(permission))
  );
  return Array.from(permissionsSet);
};

/**
 * Parse the organization permissions array (returned by listPermissions / getAllPermissions API)
 * into structured roles, permissions, and permissionsMapping objects.
 *
 * Input format (from API):
 * [
 *   { component: 'organization', roles: { viewer: ['read'], admin: ['read', 'write', ...] } },
 *   { component: 'workspace', roles: { ... } },
 *   ...
 * ]
 *
 * Output: { roles, permissions, permissionsMapping }
 */
const parseOrganizationPermissions = (organizationPermissions, addNoneRole = false) => {
  if (organizationPermissions == null) {
    console.warn("Organization permissions value is null or undefined, can't parse it.");
    return null;
  }
  if (!Array.isArray(organizationPermissions)) {
    console.error("Organization permissions value is not an array, can't parse it.");
    return null;
  }

  const roles = {};
  const permissions = {};
  const permissionsMapping = {};

  for (const componentPermissions of organizationPermissions) {
    const componentKey = componentPermissions.component;
    const mapping = componentPermissions.roles;
    roles[componentKey] = _getRolesFromMapping(mapping);
    permissions[componentKey] = _getPermissionsFromMapping(mapping);
    permissionsMapping[componentKey] = mapping;
  }

  if (addNoneRole === true) {
    for (const componentPermissions of organizationPermissions) {
      const componentKey = componentPermissions.component;
      !roles[componentKey].includes('none') && roles[componentKey].unshift('none');
      permissionsMapping[componentKey].none === undefined && (permissionsMapping[componentKey].none = []);
    }
  }

  return { roles, permissions, permissionsMapping };
};

/**
 * Get translated labels for roles.
 */
const getRolesLabels = (t, rolesNames) => {
  const rolesLabels = [];
  rolesNames.forEach((roleName) =>
    rolesLabels.push({ value: roleName, label: t(`commoncomponents.dialog.share.roles.${roleName}`, roleName) })
  );
  return rolesLabels;
};

/**
 * Get translated labels for permissions.
 */
const getPermissionsLabels = (t, permissionsNames) => {
  const permissionsLabels = [];
  permissionsNames.forEach((permissionName) =>
    permissionsLabels.push({
      value: permissionName,
      label: t(`commoncomponents.dialog.share.permissions.${permissionName}`, permissionName),
    })
  );
  return permissionsLabels;
};

export const SecurityUtils = {
  areAccessControlListsIdentical,
  compareAccessControlLists,
  getPermissionsFromRole,
  getRolesGrantingPermission,
  getUserPermissionsForResource,
  getUserRoleForResource,
  getUsersIdsFromACL,
  parseOrganizationPermissions,
  sortByNewAdminsFirst,
  transposeMappingDict,
  updateResourceSecurity,
  getRolesLabels,
  getPermissionsLabels,
};
