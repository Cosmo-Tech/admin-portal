// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAllWorkspaces = createAsyncThunk('workspaces/getAllWorkspaces', async (arg, thunkAPI) => {
  const { Api } = thunkAPI.extra;
  const { data } = await Api.Workspaces.findAllWorkspaces('o-vloxvdke5gqvx');
  return data;
});
