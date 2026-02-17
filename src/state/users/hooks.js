// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import createKeycloakUser from './thunks/createKeycloakUser.js';
import deleteKeycloakUser from './thunks/deleteKeycloakUser.js';
import fetchRealmUsers from './thunks/fetchRealmUsers.js';

/** Get the list of Keycloak users (enriched with permissions & roles). */
export const useUsersList = () => useSelector((state) => state.users.list);

/** Get the loading status of the users slice. */
export const useUsersListStatus = () => useSelector((state) => state.users.status);

/** Get the error message, if any, from the users slice. */
export const useUsersError = () => useSelector((state) => state.users.error);

/** Get the last-login timestamp map (userId → timestamp). */
export const useLastLoginMap = () => useSelector((state) => state.users.lastLoginMap);

/** Dispatch the full Keycloak users fetch + enrichment workflow. */
export const useFetchRealmUsers = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(fetchRealmUsers()), [dispatch]);
};

/** Create a new Keycloak user with a temporary password. */
export const useCreateKeycloakUser = () => {
  const dispatch = useDispatch();
  return useCallback((userData) => dispatch(createKeycloakUser(userData)), [dispatch]);
};

/** Delete a Keycloak user by ID. */
export const useDeleteKeycloakUser = () => {
  const dispatch = useDispatch();
  return useCallback((userId) => dispatch(deleteKeycloakUser(userId)), [dispatch]);
};
