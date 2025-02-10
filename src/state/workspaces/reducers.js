// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { createSlice } from '@reduxjs/toolkit';
import { getAllWorkspaces } from './thunks/GetAllWorkspaces.js';

const initialWorkspacesState = {
  list: [],
  status: 'IDLE',
};

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState: initialWorkspacesState,
  reducers: {},
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

export default workspacesSlice.reducer;
