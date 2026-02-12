// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useSelector } from 'react-redux';

export const useRunnersList = () => {
  return useSelector((state) => state.runners.list);
};

export const useRunnersListStatus = () => {
  return useSelector((state) => state.runners.status);
};

/**
 * Get runners for a specific workspace
 */
export const useRunnersForWorkspace = (workspaceId, organizationId) => {
  return useSelector((state) =>
    state.runners.list.filter(
      (runner) => runner.workspaceId === workspaceId && runner.organizationId === organizationId
    )
  );
};
