// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Link, useLocation } from 'react-router';
import {
  DashboardOutlined as DashboardOutlinedIcon,
  ManageAccountsOutlined as ManageAccountsOutlinedIcon,
  CategoryOutlined as CategoryOutlinedIcon,
  TuneOutlined as TuneOutlinedIcon,
} from '@mui/icons-material';
import { Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';

export const NavigationMenu = () => {
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    {
      text: '[WIP] Dashboards',
      icon: <DashboardOutlinedIcon />,
      to: '/dashboards',
    },
    {
      text: '[WIP] Users',
      icon: <ManageAccountsOutlinedIcon />,
      to: '/users',
    },
    {
      text: '[WIP] Resources',
      icon: <CategoryOutlinedIcon />,
      to: '/resources',
    },
    {
      text: '[WIP] Roles',
      icon: <TuneOutlinedIcon />,
      to: '/roles',
    },
    {
      text: 'Solutions',
      to: '/solution',
    },
    {
      text: 'Workspaces',
      to: '/workspace',
    },
    {
      text: 'Organizations',
      to: '/organization',
    },
    {
      text: 'Scenarios',
      to: '/scenario',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        height: 'calc(100vh - 160px)', // 64px (appbar) + 2*48px (padding)
        width: '100%',
        margin: '0px',
        paddingY: '48px',
        paddingX: '16px',
        maxWidth: 280,
        bgcolor: '#FFFAF5',
      }}
    >
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.to;
          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                my: 4,
                borderRadius: '48px',
                height: '48px',
                '&:hover': {
                  bgcolor: theme.palette.secondary.light,
                  opacity: 0.8,
                },
              }}
            >
              <ListItemButton
                component={Link}
                to={item.to}
                selected={isSelected}
                sx={{
                  borderRadius: '48px',
                  height: '48px',
                  '&.Mui-selected': {
                    bgcolor: `#C1670014`,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.light,
                    },
                  },
                  '&:hover': {
                    bgcolor: theme.palette.secondary.light,
                    opacity: 0.8,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? '#C16700' : theme.palette.text.primary,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? '#C16700' : theme.palette.text.primary,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
