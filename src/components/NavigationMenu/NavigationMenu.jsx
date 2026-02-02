// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import {
  DashboardOutlined as DashboardOutlinedIcon,
  ManageAccountsOutlined as ManageAccountsOutlinedIcon,
  CategoryOutlined as CategoryOutlinedIcon,
  TuneOutlined as TuneOutlinedIcon,
  HelpOutlineOutlined as HelpOutlineIcon,
  MoreVertOutlined as MoreVertIcon,
} from '@mui/icons-material';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
  Avatar,
  Divider,
  Typography,
} from '@mui/material';
import { useAuth } from 'src/state/auth/hooks.js';

export const NavigationMenu = () => {
  const location = useLocation();
  const theme = useTheme();
  const auth = useAuth();

  const userInitials = useMemo(() => {
    if (!auth.userName) return 'UN';
    const parts = auth.userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }, [auth.userName]);

  const menuItems = [
    {
      text: 'Solutions',
      icon: <DashboardOutlinedIcon />,
      to: '/solution',
    },
    {
      text: 'Workspaces',
      icon: <CategoryOutlinedIcon />,
      to: '/workspace',
    },
    {
      text: 'Organizations',
      icon: <ManageAccountsOutlinedIcon />,
      to: '/organization',
    },
    {
      text: 'Scenarios',
      icon: <TuneOutlinedIcon />,
      to: '/scenario',
    },
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
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.primary.main,
        borderRight: '1px solid #E9ECEF',
        paddingY: '16px',
        paddingLeft: '0px',
        paddingRight: '16px',
        maxWidth: 280,
        boxSizing: 'border-box',
        overflow: 'hidden', // Empêche la sidebar entière de scroller
      }}
    >
      <Box sx={{ px: 2, mb: 2, display: 'flex-end', justifyContent: 'center' }}>
        <Box
          component="img"
          sx={{ height: '39px', width: '100px', maxHeight: '39px', maxWidth: '100px' }}
          alt="Cosmo Tech"
          src={theme.palette.mode === 'dark' ? '/cosmotech_logo_dark_theme.png' : '/cosmotech_logo_light_theme.png'}
        />
      </Box>
      {/* Navigation Items */}
      <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.to;
          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                mb: 1,
                borderRadius: '24px 24px 24px 24px',
                height: '48px',
              }}
            >
              <ListItemButton
                component={Link}
                to={item.to}
                selected={isSelected}
                sx={{
                  borderRadius: '24px 24px 24px 24px',
                  height: '48px',
                  '&.Mui-selected': {
                    bgcolor: '#212529',
                    '&:hover': {
                      bgcolor: '#212529',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#F8F9FA',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? '#FFFFFF' : '#212529',
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
                      color: isSelected ? '#FFFFFF' : '#212529',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ mt: 'auto' }}>
        {/* Help & Documentation */}
        <ListItem
          disablePadding
          sx={{
            mb: 1,
            borderRadius: '0px 24px 24px 0px',
            height: '48px',
          }}
        >
          <ListItemButton
            component={Link}
            to="/help"
            sx={{
              borderRadius: '0px 24px 24px 0px',
              height: '48px',
              '&:hover': {
                bgcolor: '#F8F9FA',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: '#212529',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.1rem',
                },
              }}
            >
              <HelpOutlineIcon />
            </ListItemIcon>
            <ListItemText
              primary="Help & Documentation"
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: '#212529',
                },
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* User Profile Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
          }}
        >
          <Avatar
            sx={{
              mr: 1.5,
              width: 40,
              height: 40,
              bgcolor: '#FFCC89',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
            src={auth.profilePic}
            alt={auth.userName}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#212529',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {auth.userName || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                color: '#6C757D',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {auth.userEmail || 'No email'}
            </Typography>
          </Box>
          <MoreVertIcon
            sx={{
              color: '#6C757D',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};
