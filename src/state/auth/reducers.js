// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';
import { AUTH_STATUS } from './constants.js';

const authInitialState = {
  error: '',
  userEmail: '',
  userId: '',
  userName: '',
  profilePic: '',
  roles: [],
  permissions: [],
  status: AUTH_STATUS.UNKNOWN,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    setAuthData: (state, action) => {
      const { error, status, userEmail, userId, userName, profilePic, roles, permissions } = action.payload;
      state.error = error;
      state.status = status;
      state.userEmail = userEmail;
      state.userId = userId;
      state.userName = userName;
      state.roles = roles;
      state.permissions = permissions;
      state.profilePic = profilePic;
    },
  },
});

export const { setAuthData } = authSlice.actions;
export default authSlice.reducer;
