// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllWorkspaces } from './thunks/GetAllWorkspaces.js';

export const useGetAllWorkspaces = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(getAllWorkspaces()), [dispatch]);
};

export const useWorkspacesListStatus = () => {
  return useSelector((state) => state.workspaces.status);
};

export const useWorkspacesList = () => {
  return useSelector((state) => state.workspaces.list);
};
