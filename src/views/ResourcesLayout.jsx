// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Outlet } from 'react-router';
import { Stack } from '@mui/material';
import { NavigationMenu } from '../components';

export const ResourcesLayout = () => {
  return (
    <Stack direction="row" sx={{ height: '100%' }}>
      <NavigationMenu />
      <Outlet />
    </Stack>
  );
};
