// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { AppBar as MuiAppBar, Box, Toolbar, Typography, useTheme, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Auth } from '@cosmotech/core';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';

export const AppBar = () => {
  const theme = useTheme();
  return (
    <MuiAppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: '#000',
      }}
    >
      <Toolbar style={{ padding: 0 }}>
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Typography
            variant="h6"
            sx={{
              textTransform: 'uppercase',
              color: '#000',
            }}
          >
          </Typography>
        </Box>
        <IconButton onClick={() => console.log('Toggle theme')} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <IconButton onClick={() => Auth.signOut()} color="inherit">
          <ExitToAppIcon />
        </IconButton>
        <LanguageSwitcher />
      </Toolbar>
    </MuiAppBar>
  );
};
