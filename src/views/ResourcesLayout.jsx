// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Outlet } from 'react-router';
import { Box, Stack } from '@mui/material';
import { NavigationMenu } from '../components';

export const ResourcesLayout = () => {
  return (
    <Stack direction="row" sx={{ height: 'calc(100vh - 64px)' }}>
      <Box sx={{ height: '100%', marginRight: '32px' }}>
        <NavigationMenu />
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', height: '100%' }}>
        <Outlet />
      </Box>
    </Stack>
  );
};
