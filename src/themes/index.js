// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createTheme } from '@mui/material/styles';

const getThemeConfig = (mode = 'light') => {
  const isLight = mode === 'light';

  return {
    palette: {
      mode,
      primary: {
        main: isLight ? '#f1f5f9' : '#1A1A1A',
        contrastText: isLight ? '#1A1A1A' : '#E8E8E8',
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
        primary: isLight ? '#1A1A1A' : '#E8E8E8',
        secondary: isLight ? '#666666' : '#8A8A8A',
        disabled: isLight ? '#999999' : '#555555',
      },
      background: {
        default: isLight ? '#FFFFFF' : '#0E0E0E',
        paper: isLight ? '#FFFFFF' : '#181818',
        surface: isLight ? '#F8F9FA' : '#1E1E1E',
        surfaceVariant: isLight ? '#F1F3F5' : '#252525',
      },
      divider: isLight ? '#E9ECEF' : '#2A2A2A',
      action: {
        hover: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
        selected: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
        focus: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
      },
      accessManagement: {
        pageText: isLight ? '#232A33' : '#E8ECF2',
        title: isLight ? '#1D232C' : '#EFEFF1',
        subtitle: isLight ? '#677282' : '#7F8893',
        panelBg: isLight ? '#FFFFFF' : '#181818',
        panelBorder: isLight ? '#D8DEE6' : '#2A313B',
        panelHeaderBg: isLight ? '#F8FAFC' : '#181818',
        usersHeaderText: isLight ? '#6B7480' : '#747E89',
        usersHeaderBorder: isLight ? '#E6EBF2' : '#1F2731',
        userRowBorder: isLight ? '#EDF1F6' : '#1C232D',
        userRowHoverBg: isLight ? 'rgba(16, 24, 32, 0.03)' : 'rgba(255,255,255,0.03)',
        selectedUserBg: isLight ? 'rgba(255, 159, 28, 0.16)' : 'rgba(255, 159, 28, 0.12)',
        selectedUserHoverBg: isLight ? 'rgba(255, 159, 28, 0.2)' : 'rgba(255, 159, 28, 0.14)',
        userNameText: isLight ? '#202833' : '#E6EAF0',
        userEmailText: isLight ? '#6C7582' : '#78818B',
        searchBg: isLight ? '#F5F6F8' : '#1D1F24',
        searchBorder: isLight ? '#D0D5DD' : '#303641',
        searchHoverBorder: isLight ? '#C0C8D2' : '#3E4652',
        searchPlaceholder: isLight ? '#76808C' : '#77818D',
        toggleBg: isLight ? '#F5F6F8' : '#1B1E24',
        toggleBorder: isLight ? '#D0D5DD' : '#303641',
        toggleHoverBg: isLight ? '#EEF1F5' : '#242933',
        toggleHoverBorder: isLight ? '#C0C8D2' : '#3E4652',
        toggleText: isLight ? '#6A7480' : '#8D97A2',
        toggleSelectedBg: isLight ? 'rgba(255, 159, 28, 0.18)' : 'rgba(255, 159, 28, 0.26)',
        toggleSelectedText: isLight ? '#B45309' : '#FFC27A',
        toggleSelectedBorder: '#FF9F1C',
        toggleSelectedHoverBg: isLight ? 'rgba(255, 159, 28, 0.24)' : 'rgba(255, 159, 28, 0.32)',
        resourceHeaderBorder: isLight ? '#E0E6EE' : '#212A34',
        assignedRolesChipBg: isLight ? '#EFF3F7' : '#2A3844',
        assignedRolesChipText: isLight ? '#5E6875' : '#8E98A4',
        countChipBg: isLight ? '#F8EBD7' : '#3A2A14',
        countChipText: '#FFB752',
        avatarText: '#FFC56F',
        avatarColors: ['#6B4A1E', '#725024', '#7A5828', '#81602D', '#896833', '#917238'],
        connector: isLight ? '#D9E0E8' : '#222B35',
        resourceItemBg: isLight ? '#FFFFFF' : '#181818',
        resourceItemHoverBg: isLight ? 'rgba(16, 24, 32, 0.03)' : 'rgba(255,255,255,0.03)',
        resourceItemBorder: isLight ? '#EDF1F6' : '#1C232D',
        resourceItemChevron: isLight ? '#7B8693' : '#7D8692',
        resourceItemText: isLight ? '#202833' : '#E6EAF0',
        resourceItemSubtext: isLight ? '#6C7582' : '#78818B',
        assignButtonBorder: isLight ? '#C5CED9' : '#3A424C',
        assignButtonText: isLight ? '#5F6B79' : '#9EA6B1',
        treeIconColors: {
          ORGANIZATION: '#FF9F1C',
          SOLUTION: '#3FA4FF',
          WORKSPACE: '#14C97A',
          RUNNER: isLight ? '#6D7682' : '#A6ACB5',
          RUN: isLight ? '#7B8490' : '#9098A3',
        },
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
        color: isLight ? '#212529' : '#FFFFFF',
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
        color: isLight ? '#6C757D' : '#8A8A8A',
      },
    },
  };
};

export const createAppTheme = (mode = 'light') => createTheme(getThemeConfig(mode));
const theme = createTheme(getThemeConfig('light'));
export default theme;
