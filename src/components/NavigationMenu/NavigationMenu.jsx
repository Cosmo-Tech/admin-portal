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
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

export const NavigationMenu = () => {
  const location = useLocation();

  const menuItems = [
    {
      text: 'Dashboards',
      icon: <DashboardOutlinedIcon />,
      to: '/dashboards',
    },
    {
      text: 'Users',
      icon: <ManageAccountsOutlinedIcon />,
      to: '/users',
    },
    {
      text: 'Resources',
      icon: <CategoryOutlinedIcon />,
      to: '/resources',
    },
    {
      text: 'Roles',
      icon: <TuneOutlinedIcon />,
      to: '/roles',
    },
  ];

  return (
    <Box sx={{ width: '100%', marginY: '32px', maxWidth: 280 }}>
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.to;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.to}
                selected={isSelected}
                sx={{
                  py: 1.25,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 237, 213, 1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 237, 213, 0.8)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 237, 213, 0.5)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: 'inherit',
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
                      fontWeight: isSelected ? 500 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
