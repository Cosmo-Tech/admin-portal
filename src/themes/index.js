// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createTheme } from '@mui/material/styles';

const getThemeConfig = (mode = 'light') => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#f1f5f9' : '#313030',
      contrastText: mode === 'light' ? '#1A1A1A' : '#E0E0E0',
    },
    secondary: {
      main: '#FF9F1C',
      light: '#FFCC89',
    },
    tertiary: {
      main: '#4CAF50',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#CC7A00',
    },
    error: {
      main: '#E53935',
    },
    text: {
      primary: mode === 'light' ? '#1A1A1A' : '#E0E0E0',
      secondary: mode === 'light' ? '#666666' : '#9E9E9E',
    },
    background: {
      default: mode === 'light' ? '#FFFFFF' : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    divider: mode === 'light' ? '#E9ECEF' : '#2A2A2A',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: mode === 'light' ? '#f8f9fa' : '#252525',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
    h1: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: mode === 'light' ? '#212529' : '#FFFFFF',
    },
    body1: {
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: mode === 'light' ? '#6C757D' : '#9E9E9E',
    },
  },
});

export const createAppTheme = (mode = 'light') => createTheme(getThemeConfig(mode));
const theme = createTheme(getThemeConfig('light'));
export default theme;
