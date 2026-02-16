// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

export const ROLE_OPTIONS = ['admin', 'editor', 'viewer', 'user', 'none'];

const ROLE_PRIORITY = {
  none: 0,
  user: 1,
  viewer: 2,
  editor: 3,
  admin: 4,
};

const ASSIGNABLE_RESOURCE_TYPES = new Set(['organizations', 'solutions', 'workspaces', 'runners']);

export const normalizeRole = (role) => {
  const normalizedRole = String(role ?? '')
    .toLowerCase()
    .trim();
  return ROLE_PRIORITY[normalizedRole] != null ? normalizedRole : 'none';
};

export const getRolePriority = (role) => {
  return ROLE_PRIORITY[normalizeRole(role)] ?? 0;
};

export const buildResourceKey = (resourceType, resourceId) => `${resourceType}:${resourceId}`;

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
