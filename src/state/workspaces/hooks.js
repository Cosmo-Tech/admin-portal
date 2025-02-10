// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
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
