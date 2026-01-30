// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#f1f5f9',
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
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    divider: '#E9ECEF',
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
          color: '#212529',
        },
        body1: {
          fontSize: '14px',
          fontWeight: 400,
        },
        caption: {
          fontSize: '12px',
          color: '#6C757D',
        },
      }
    }
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
      color: '#212529',
    },
    body1: {
      fontSize: '0.875rem', // 14px
    },
    caption: {
      fontSize: '0.75rem', // 12px
      color: '#6C757D',
    },
  },
});

export default theme;
