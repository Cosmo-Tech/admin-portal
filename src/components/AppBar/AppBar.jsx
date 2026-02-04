// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { AppBar as MuiAppBar, Box, Toolbar, Typography, useTheme, IconButton } from '@mui/material';
import { Auth } from '@cosmotech/core';
import { useToggleTheme, useThemeMode } from '../../state/theme/hooks.js';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';

export const AppBar = () => {
  const theme = useTheme();
  const themeMode = useThemeMode();
  const toggleTheme = useToggleTheme();

  return (
    <MuiAppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar style={{ padding: 0 }}>
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Typography
            variant="h6"
            sx={{
              textTransform: 'uppercase',
              color: theme.palette.primary.contrastText,
            }}
          />
        </Box>
        <IconButton onClick={toggleTheme} color="inherit">
          {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <IconButton onClick={() => Auth.signOut()} color="inherit">
          <ExitToAppIcon />
        </IconButton>
        <LanguageSwitcher />
      </Toolbar>
    </MuiAppBar>
  );
};
