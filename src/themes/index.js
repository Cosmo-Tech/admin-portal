// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createTheme } from '@mui/material/styles';

const getThemeConfig = (mode = 'light') => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#f1f5f9' : '#1A1A1A',
      contrastText: mode === 'light' ? '#1A1A1A' : '#E8E8E8',
    },
    secondary: {
      main: '#FF9F1C',
      light: '#FFCC89',
      dark: '#CC7A00',
    },
    tertiary: {
      main: '#4CAF50',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#CC7A00',
      light: '#FFB74D',
    },
    error: {
      main: '#E53935',
    },
    text: {
      primary: mode === 'light' ? '#1A1A1A' : '#E8E8E8',
      secondary: mode === 'light' ? '#666666' : '#8A8A8A',
      disabled: mode === 'light' ? '#999999' : '#555555',
    },
    background: {
      default: mode === 'light' ? '#FFFFFF' : '#0E0E0E',
      paper: mode === 'light' ? '#FFFFFF' : '#181818',
      surface: mode === 'light' ? '#F8F9FA' : '#1E1E1E',
      surfaceVariant: mode === 'light' ? '#F1F3F5' : '#252525',
    },
    divider: mode === 'light' ? '#E9ECEF' : '#2A2A2A',
    action: {
      hover: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
      selected: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      focus: mode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
    },
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
            backgroundColor: mode === 'light' ? '#f8f9fa' : '#1E1E1E',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
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
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8125rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: mode === 'light' ? '#6C757D' : '#8A8A8A',
    },
  },
});

export const createAppTheme = (mode = 'light') => createTheme(getThemeConfig(mode));
const theme = createTheme(getThemeConfig('light'));
export default theme;
