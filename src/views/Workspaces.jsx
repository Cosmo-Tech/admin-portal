// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useEffect } from 'react';
import { AppBar } from '../components/AppBar/AppBar.jsx';
import { useGetAllWorkspaces, useWorkspacesList, useWorkspacesListStatus } from '../state/workspaces/hooks.js';

export const Workspaces = () => {
  const getAllWorkspaces = useGetAllWorkspaces();
  const workspaces = useWorkspacesList();
  const workspacesStatus = useWorkspacesListStatus();

  useEffect(() => {
    getAllWorkspaces();
  }, [getAllWorkspaces]);

  if (workspacesStatus === 'LOADING') return <h1>Loading...</h1>;
  return (
    <div>
      <AppBar />
      {workspaces && workspacesStatus !== 'LOADING' && (
        <ol>
          {workspaces.map((workspace) => (
            <li key={workspace.id}>{workspace.name}</li>
          ))}
        </ol>
      )}
    </div>
  );
};
