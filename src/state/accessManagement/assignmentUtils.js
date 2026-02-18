// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { SecurityUtils } from 'src/utils/SecurityUtils.js';
import { ASSIGNABLE_RESOURCE_TYPES, WRITE_SECURITY_PERMISSION } from './constants.js';

// ---------------------------------------------------------------------------
// Role definitions
// ---------------------------------------------------------------------------

export const ROLE_OPTIONS = ['admin', 'editor', 'viewer', 'user', 'none'];

const ROLE_PRIORITY = {
  none: 0,
  user: 1,
  viewer: 2,
  editor: 3,
  admin: 4,
};

export const normalizeRole = (role) => {
  const normalizedRole = String(role ?? '')
    .toLowerCase()
    .trim();
  return ROLE_PRIORITY[normalizedRole] != null ? normalizedRole : 'none';
};

export const getRolePriority = (role) => {
  return ROLE_PRIORITY[normalizeRole(role)] ?? 0;
};

// ---------------------------------------------------------------------------
// Resource key helpers
// ---------------------------------------------------------------------------

export const buildResourceKey = (resourceType, resourceId) => `${resourceType}:${resourceId}`;

// ---------------------------------------------------------------------------
// String helpers (shared across ACL logic)
// ---------------------------------------------------------------------------

export const toLowerCaseOrEmpty = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim();

// ---------------------------------------------------------------------------
// User identity helpers
// ---------------------------------------------------------------------------

export const getUserIdentifiers = (user) => {
  const values = [user?.email, user?.username, user?.id];
  const seen = new Set();
  return values.map(toLowerCaseOrEmpty).filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// ---------------------------------------------------------------------------
// ACL / security helpers
// ---------------------------------------------------------------------------

export const findExplicitAclEntry = (security, userIdentifiers) => {
  const aclList = Array.isArray(security?.accessControlList) ? security.accessControlList : [];
  return aclList.find((entry) => userIdentifiers.includes(toLowerCaseOrEmpty(entry?.id))) ?? null;
};

export const getRoleFromUserPermissions = (user, resourceType, resourceId) => {
  const role = user?.resourcePermissions?.[resourceType]?.[resourceId]?.role;
  return role != null ? role : null;
};

export const getFallbackRoleFromSecurity = (security, user) => {
  const identity = user?.email ?? user?.username ?? user?.id;
  if (!security || !identity) return security?.default ?? 'none';
  return SecurityUtils.getUserRoleForResource(security, identity) ?? security?.default ?? 'none';
};

export const hasWriteSecurityPermission = (resource) => {
  const currentPermissions = Array.isArray(resource?.security?.currentUserPermissions)
    ? resource.security.currentUserPermissions
    : [];
  return currentPermissions.some((permission) => toLowerCaseOrEmpty(permission) === WRITE_SECURITY_PERMISSION);
};

export const getAssignedRolesCountFromPermissions = (user) => {
  if (!user?.resourcePermissions) return 0;
  const resourceGroups = ['organizations', 'solutions', 'workspaces', 'runners'];
  let assignedCount = 0;

  for (const resourceGroup of resourceGroups) {
    const entries = Object.values(user.resourcePermissions?.[resourceGroup] ?? {});
    for (const entry of entries) {
      if (normalizeRole(entry?.role) !== 'none') assignedCount += 1;
    }
  }

  return assignedCount;
};

// ---------------------------------------------------------------------------
// Workspace / solution linking
// ---------------------------------------------------------------------------

export const getLinkedSolutionId = (workspace) => {
  return workspace?.solution?.solutionId ?? workspace?.solution?.id ?? workspace?.solutionId ?? null;
};

// ---------------------------------------------------------------------------
// Propagation target computation
// ---------------------------------------------------------------------------

export const computeWorkspacePropagationTargets = (resourceByKey, workspaceResource) => {
  if (!workspaceResource || workspaceResource.resourceType !== 'workspaces') return [];

  const targets = [];

  if (workspaceResource.organizationId) {
    const organizationKey = buildResourceKey('organizations', workspaceResource.organizationId);
    if (resourceByKey.has(organizationKey)) targets.push(organizationKey);
  }

  if (workspaceResource.solutionId) {
    const solutionKey = buildResourceKey('solutions', workspaceResource.solutionId);
    if (resourceByKey.has(solutionKey)) targets.push(solutionKey);
  }

  return targets;
};

export const computeRunnerPropagationTargets = (resourceByKey, runnerResource) => {
  if (!runnerResource || runnerResource.resourceType !== 'runners') return [];

  const targets = [];

  if (runnerResource.workspaceId) {
    const workspaceKey = buildResourceKey('workspaces', runnerResource.workspaceId);
    if (resourceByKey.has(workspaceKey)) targets.push(workspaceKey);
  }

  if (runnerResource.organizationId) {
    const organizationKey = buildResourceKey('organizations', runnerResource.organizationId);
    if (resourceByKey.has(organizationKey)) targets.push(organizationKey);
  }

  if (runnerResource.solutionId) {
    const solutionKey = buildResourceKey('solutions', runnerResource.solutionId);
    if (resourceByKey.has(solutionKey)) targets.push(solutionKey);
  }

  return targets;
};

export const computeSolutionPropagationTargets = (resourceByKey, solutionResource) => {
  if (!solutionResource || solutionResource.resourceType !== 'solutions') return [];

  const targets = [];

  if (solutionResource.organizationId) {
    const organizationKey = buildResourceKey('organizations', solutionResource.organizationId);
    if (resourceByKey.has(organizationKey)) targets.push(organizationKey);
  }

  return targets;
};

// ---------------------------------------------------------------------------
// Effective assignments (core draft + propagation algorithm)
// ---------------------------------------------------------------------------

export const computeEffectiveAssignments = (resourceViewModels = [], draftAssignments = {}) => {
  const resourceByKey = new Map(resourceViewModels.map((resource) => [resource.resourceKey, resource]));

  const assignments = {};
  for (const resource of resourceViewModels) {
    const baseRole = normalizeRole(resource.baseRole);
    assignments[resource.resourceKey] = {
      resourceKey: resource.resourceKey,
      baseRole,
      effectiveRole: baseRole,
      draftSource: null,
      isDraft: false,
    };
  }

  const normalizedDrafts = {};
  for (const [resourceKey, draft] of Object.entries(draftAssignments)) {
    const resource = resourceByKey.get(resourceKey);
    if (!resource) continue;

    const draftRole = normalizeRole(draft?.role);
    const baseRole = assignments[resourceKey].baseRole;

    // Ignore no-op drafts; this keeps the UI state deterministic.
    if (draftRole === baseRole) continue;

    normalizedDrafts[resourceKey] = {
      role: draftRole,
      source: 'direct',
      touchedAt: draft?.touchedAt ?? Date.now(),
    };

    assignments[resourceKey] = {
      ...assignments[resourceKey],
      effectiveRole: draftRole,
      draftSource: 'direct',
      isDraft: true,
    };
  }

  const autoCandidates = new Map();

  for (const [resourceKey, draft] of Object.entries(normalizedDrafts)) {
    const resource = resourceByKey.get(resourceKey);
    if (!resource) continue;

    let propagationTargets = [];
    if (resource.resourceType === 'workspaces') {
      propagationTargets = computeWorkspacePropagationTargets(resourceByKey, resource);
    } else if (resource.resourceType === 'runners') {
      propagationTargets = computeRunnerPropagationTargets(resourceByKey, resource);
    } else if (resource.resourceType === 'solutions') {
      propagationTargets = computeSolutionPropagationTargets(resourceByKey, resource);
    } else {
      continue;
    }

    for (const targetKey of propagationTargets) {
      // Manual parent drafts override propagation.
      if (normalizedDrafts[targetKey]?.source === 'direct') continue;
      // Propagation should only fill empty parent roles.
      if (assignments[targetKey]?.baseRole !== 'none') continue;

      const existingCandidate = autoCandidates.get(targetKey);
      if (!existingCandidate) {
        autoCandidates.set(targetKey, {
          role: draft.role,
          touchedAt: draft.touchedAt,
          from: [resourceKey],
        });
        continue;
      }

      const currentPriority = getRolePriority(existingCandidate.role);
      const candidatePriority = getRolePriority(draft.role);
      const isHigher = candidatePriority > currentPriority;
      const isSameAndNewer = candidatePriority === currentPriority && draft.touchedAt > existingCandidate.touchedAt;

      if (isHigher || isSameAndNewer) {
        autoCandidates.set(targetKey, {
          role: draft.role,
          touchedAt: draft.touchedAt,
          from: [...existingCandidate.from, resourceKey],
        });
      }
    }
  }

  for (const [targetKey, candidate] of autoCandidates.entries()) {
    const currentAssignment = assignments[targetKey];
    if (!currentAssignment || currentAssignment.draftSource === 'direct') continue;

    // Do not mark unchanged parent roles as draft.
    if (candidate.role === currentAssignment.baseRole) continue;

    assignments[targetKey] = {
      ...currentAssignment,
      effectiveRole: candidate.role,
      draftSource: 'auto',
      isDraft: true,
      propagatedFrom: candidate.from,
    };
  }

  return assignments;
};

// ---------------------------------------------------------------------------
// ACL operation builder (computes API delta for a single resource)
// ---------------------------------------------------------------------------

export const buildAclOperation = (resourceModel, effectiveRole) => {
  if (!resourceModel || !ASSIGNABLE_RESOURCE_TYPES.has(resourceModel.resourceType)) return null;

  const baseRole = normalizeRole(resourceModel.baseRole);
  const targetRole = normalizeRole(effectiveRole);
  const hasExplicitAccess = Boolean(resourceModel.hasExplicitAccess);
  const explicitIdentityId = resourceModel.explicitIdentityId || null;
  const preferredIdentityId = resourceModel.preferredIdentityId || null;

  let operationType = null;
  let identityId = null;

  if (targetRole === 'none') {
    // Can only remove explicit ACL entries; default security is not removed through ACL endpoints.
    if (!hasExplicitAccess || !explicitIdentityId) return null;
    if (baseRole === targetRole) return null;
    operationType = 'remove';
    identityId = explicitIdentityId;
  } else if (hasExplicitAccess && explicitIdentityId) {
    if (baseRole === targetRole) return null;
    operationType = 'update';
    identityId = explicitIdentityId;
  } else {
    // No explicit ACL entry: create one when target differs from effective/default role.
    if (baseRole === targetRole || !preferredIdentityId) return null;
    operationType = 'add';
    identityId = preferredIdentityId;
  }

  return {
    operationType,
    identityId,
    resourceType: resourceModel.resourceType,
    organizationId: resourceModel.organizationId,
    solutionId: resourceModel.solutionId,
    workspaceId: resourceModel.workspaceId,
    runnerId: resourceModel.runnerId,
    role: targetRole,
  };
};

// ---------------------------------------------------------------------------
// Error message builder
// ---------------------------------------------------------------------------

export const buildSaveErrorMessage = (baseMessage, error) => {
  const statusCode = error?.response?.status;
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    error?.toString?.() ||
    'Unknown error';

  if (statusCode) return `${baseMessage} (${statusCode}: ${apiMessage})`;
  return `${baseMessage} (${apiMessage})`;
};
