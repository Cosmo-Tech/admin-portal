// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import fetchInitialData from './thunks/fetchInitialData.js';

// Selectors
export const useAppStatus = () => useSelector((state) => state.app.status);
export const useAppError = () => useSelector((state) => state.app.error);
export const useApiVersion = () => useSelector((state) => state.app.apiVersion);

// Permissions selectors
export const useApplicationRoles = () => useSelector((state) => state.app.roles);
export const useApplicationPermissions = () => useSelector((state) => state.app.permissions);
export const useApplicationPermissionsMapping = () => useSelector((state) => state.app.permissionsMapping);

/**
 * Get the permissionsMapping for a specific component (e.g. 'organization', 'workspace', 'runner', 'dataset').
 */
export const useComponentPermissionsMapping = (component) =>
  useSelector((state) => state.app.permissionsMapping?.[component] ?? {});

/**
 * Get the roles for a specific component.
 */
export const useComponentRoles = (component) => useSelector((state) => state.app.roles?.[component] ?? []);

// Action dispatchers
export const useFetchInitialData = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(fetchInitialData()), [dispatch]);
};
