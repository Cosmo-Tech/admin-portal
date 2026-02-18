// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

/**
 * Apply a single ACL operation to the API.
 * Each operation describes an add, update, or remove action for one resource.
 */
const applyAclOperation = async (api, operation) => {
  const rolePayload = { role: operation.role };

  if (operation.resourceType === 'organizations') {
    if (operation.operationType === 'add') {
      await api.Organizations.addOrganizationAccessControl(operation.organizationId, {
        id: operation.identityId,
        role: operation.role,
      });
      return;
    }
    if (operation.operationType === 'update') {
      await api.Organizations.updateOrganizationAccessControl(
        operation.organizationId,
        operation.identityId,
        rolePayload
      );
      return;
    }
    if (operation.operationType === 'remove') {
      await api.Organizations.removeOrganizationAccessControl(operation.organizationId, operation.identityId);
    }
    return;
  }

  if (operation.resourceType === 'solutions') {
    if (!operation.organizationId || !operation.solutionId) return;
    if (operation.operationType === 'add') {
      await api.Solutions.addSolutionAccessControl(operation.organizationId, operation.solutionId, {
        id: operation.identityId,
        role: operation.role,
      });
      return;
    }
    if (operation.operationType === 'update') {
      await api.Solutions.updateSolutionAccessControl(
        operation.organizationId,
        operation.solutionId,
        operation.identityId,
        rolePayload
      );
      return;
    }
    if (operation.operationType === 'remove') {
      await api.Solutions.removeSolutionAccessControl(
        operation.organizationId,
        operation.solutionId,
        operation.identityId
      );
    }
    return;
  }

  if (operation.resourceType === 'workspaces') {
    if (!operation.organizationId || !operation.workspaceId) return;
    if (operation.operationType === 'add') {
      await api.Workspaces.addWorkspaceAccessControl(operation.organizationId, operation.workspaceId, {
        id: operation.identityId,
        role: operation.role,
      });
      return;
    }
    if (operation.operationType === 'update') {
      await api.Workspaces.updateWorkspaceAccessControl(
        operation.organizationId,
        operation.workspaceId,
        operation.identityId,
        rolePayload
      );
      return;
    }
    if (operation.operationType === 'remove') {
      await api.Workspaces.removeWorkspaceAccessControl(
        operation.organizationId,
        operation.workspaceId,
        operation.identityId
      );
    }
    return;
  }

  if (operation.resourceType === 'runners') {
    if (!operation.organizationId || !operation.workspaceId || !operation.runnerId) return;
    if (operation.operationType === 'add') {
      await api.Runners.addRunnerAccessControl(operation.organizationId, operation.workspaceId, operation.runnerId, {
        id: operation.identityId,
        role: operation.role,
      });
      return;
    }
    if (operation.operationType === 'update') {
      await api.Runners.updateRunnerAccessControl(
        operation.organizationId,
        operation.workspaceId,
        operation.runnerId,
        operation.identityId,
        rolePayload
      );
      return;
    }
    if (operation.operationType === 'remove') {
      await api.Runners.removeRunnerAccessControl(
        operation.organizationId,
        operation.workspaceId,
        operation.runnerId,
        operation.identityId
      );
    }
  }
};

/**
 * Redux thunk that persists an array of ACL operations to the API.
 *
 * @param {Array} pendingOperations - Array of operation objects from buildAclOperation.
 * @returns {Function} Redux thunk function.
 */
function saveAclAssignments(pendingOperations) {
  return async (_dispatch, _getState, extraArgument) => {
    const { api } = extraArgument;
    for (const operation of pendingOperations) {
      await applyAclOperation(api, operation);
    }
  };
}

export default saveAclAssignments;
