// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAllWorkspaces = createAsyncThunk('workspaces/getAllWorkspaces', async (arg, thunkAPI) => {
  const { Api } = thunkAPI.extra;
  const { data } = await Api.Workspaces.findAllWorkspaces('o-vloxvdke5gqvx');
  return data;
});
