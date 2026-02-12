// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';
import { getAllWorkspaces } from './thunks/getAllWorkspaces.js';

const initialWorkspacesState = {
  list: [],
  status: 'IDLE',
};

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState: initialWorkspacesState,
  reducers: {
    setWorkspaces: (state, action) => {
      const { workspaces } = action.payload;
      state.list = workspaces;
      state.status = 'IDLE';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllWorkspaces.pending, (state, action) => {
        state.status = 'LOADING';
      })
      .addCase(getAllWorkspaces.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = 'IDLE';
      })
      .addCase(getAllWorkspaces.rejected, (state, action) => {
        state.status = 'ERROR';
      });
  },
});

export const { setWorkspaces } = workspacesSlice.actions;
export default workspacesSlice.reducer;
