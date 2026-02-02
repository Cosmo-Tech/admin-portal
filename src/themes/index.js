// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createTheme } from '@mui/material/styles';

const getThemeConfig = (mode = 'light') => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#f1f5f9' : '#1a1a1a',
    },
    secondary: {
      main: '#FFCC89',
      light: '#FFEDD5',
    },
    tertiary: {
      main: '#4CAF50',
    },
    error: {
      main: '#FF4444',
    },
    text: {
      primary: mode === 'light' ? '#1A1A1A' : '#FFFFFF',
      secondary: mode === 'light' ? '#666666' : '#B0B0B0',
    },
    background: {
      default: mode === 'light' ? '#FFFFFF' : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    divider: mode === 'light' ? '#E9ECEF' : '#333333',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: '24px',
          fontWeight: 700,
          color: mode === 'light' ? '#212529' : '#FFFFFF',
        },
        body1: {
          fontSize: '14px',
          fontWeight: 400,
        },
        caption: {
          fontSize: '12px',
          color: mode === 'light' ? '#6C757D' : '#A0A0A0',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '1.5rem', // ~24px
      fontWeight: 700,
      color: mode === 'light' ? '#212529' : '#FFFFFF',
    },
    body1: {
      fontSize: '0.875rem', // 14px
    },
    caption: {
      fontSize: '0.75rem', // 12px
      color: mode === 'light' ? '#6C757D' : '#A0A0A0',
    },
  },
});

export const createAppTheme = (mode = 'light') => createTheme(getThemeConfig(mode));

// Default theme for initial render
const theme = createTheme(getThemeConfig('light'));

export default theme;
