// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
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
