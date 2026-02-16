// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';
import { USERS_STATUS } from './constants.js';

const initialState = {
  /** @type {Array} Keycloak user objects enriched with permissions and roles */
  list: [],
  /** @type {string} IDLE | LOADING | SUCCESS | ERROR */
  status: USERS_STATUS.IDLE,
  /** @type {string|null} Error message if fetching failed */
  error: null,
  /** @type {Object} Map of userId → most recent login timestamp */
  lastLoginMap: {},
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.list = action.payload.users;
    },
    setUsersStatus: (state, action) => {
      state.status = action.payload.status;
      if (action.payload.error !== undefined) {
        state.error = action.payload.error;
      }
    },
    setLastLoginMap: (state, action) => {
      state.lastLoginMap = action.payload.lastLoginMap;
    },
    /**
     * Enrich each user in the list with their computed resource permissions.
     * Payload: { permissionsByUserId: { [userId]: { organizations: {...}, solutions: {...}, workspaces: {...}, runners: {...} } } }
     */
    setUserPermissions: (state, action) => {
      const { permissionsByUserId } = action.payload;
      for (const user of state.list) {
        if (permissionsByUserId[user.id]) {
          user.resourcePermissions = permissionsByUserId[user.id];
        }
      }
    },
    /**
     * Set realm roles for each user.
     * Payload: { rolesByUserId: { [userId]: { realmRoles: [...], isPlatformAdmin: boolean } } }
     */
    setUserRealmRoles: (state, action) => {
      const { rolesByUserId } = action.payload;
      for (const user of state.list) {
        if (rolesByUserId[user.id]) {
          user.realmRoles = rolesByUserId[user.id].realmRoles;
          user.isPlatformAdmin = rolesByUserId[user.id].isPlatformAdmin;
        }
      }
    },
    resetUsersState: () => initialState,
  },
});

export const { setUsers, setUsersStatus, setLastLoginMap, setUserPermissions, setUserRealmRoles, resetUsersState } =
  usersSlice.actions;
export default usersSlice.reducer;
