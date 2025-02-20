// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { AppBar as MuiAppBar, Box, Toolbar, Typography } from '@mui/material';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';

export const AppBar = () => {
  return (
    <MuiAppBar position="static">
      <Toolbar style={{ padding: 0 }}>
        <Box
          component="img"
          sx={{ height: '39px', width: '100px', maxHeight: '39px', maxWidth: '100px', margin: '0 16px' }}
          alt="Cosmo Tech"
          src="/cosmotech_logo_dark_theme.png"
        />
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Typography variant="h6" style={{ textTransform: 'uppercase' }}>
            user & permission management
          </Typography>
        </Box>
        <LanguageSwitcher />
      </Toolbar>
    </MuiAppBar>
  );
};
