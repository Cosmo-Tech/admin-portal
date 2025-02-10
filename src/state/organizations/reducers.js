// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';

const organizationsInitialState = {
  list: [],
  status: 'IDLE',
};

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState: organizationsInitialState,
  reducers: {
    setOrganizations: (state, action) => {
      const { organizations } = action.payload;
      state.list = organizations;
      state.status = 'IDLE';
    },
    setOrganizationsListStatus: (state, action) => {
      const { status } = action.payload;
      state.status = status;
    },
  },
});

export const { setOrganizations, setOrganizationsListStatus } = organizationsSlice.actions;
export default organizationsSlice.reducer;
