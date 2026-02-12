// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AUTH_STATUS } from './constants.js';
import { setAuthData } from './reducers.js';
import { login } from './thunks/login.js';

export const useLogin = () => {
  const dispatch = useDispatch();
  return useCallback((provider) => dispatch(login({ provider })), [dispatch]);
};

export const useAuthStatus = () => {
  return useSelector((state) => state.auth.status);
};

export const useAuth = () => {
  return useSelector((state) => state.auth);
};

export const useSetAuthData = () => {
  const dispatch = useDispatch();
  return useCallback((data) => dispatch(setAuthData(data)), [dispatch]);
};

export const useIsAuthenticated = () => {
  const authStatus = useAuthStatus();
  return useMemo(() => {
    return authStatus === AUTH_STATUS.AUTHENTICATED || authStatus === AUTH_STATUS.DISCONNECTING;
  }, [authStatus]);
};

/** Get the current user's JWT/app roles (e.g. ['Platform.Admin', 'Organization.User']) */
export const useUserRoles = () => {
  return useSelector((state) => state.auth.roles);
};

/** Get the current user's email */
export const useUserEmail = () => {
  return useSelector((state) => state.auth.userEmail);
};

/** Get the current user's ID */
export const useUserId = () => {
  return useSelector((state) => state.auth.userId);
};

/**
 * Get the current user's app-level permissions.
 * These are resolved from JWT roles and stored during login.
 */
export const useUserAppPermissions = () => {
  return useSelector((state) => state.auth.permissions);
};
