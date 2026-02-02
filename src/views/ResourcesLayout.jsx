// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Outlet } from 'react-router';
import { Box, Stack } from '@mui/material';
import { NavigationMenu, AppBar } from '../components';

export const ResourcesLayout = () => {
  return (
    <Stack direction="row" sx={{ height: '100vh' }}>
      <Box sx={{ height: '100%' }}>
        <NavigationMenu />
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppBar />
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Stack>
  );
};
