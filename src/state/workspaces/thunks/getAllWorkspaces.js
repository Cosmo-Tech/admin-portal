// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAllWorkspaces = createAsyncThunk('workspaces/getAllWorkspaces', async (arg, thunkAPI) => {
  const { api } = thunkAPI.extra;
  const { data } = await api.Workspaces.findAllWorkspaces('o-vloxvdke5gqvx');
  return data;
});
