// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { APP_ROLES } from 'src/services/config/accessControl/Roles.js';
import { useUserRoles } from 'src/state/auth/hooks.js';
import { useUsersList, useLastLoginMap } from 'src/state/users/hooks.js';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { UserActions } from './UserActions';
import { UserStatusChip } from './UserStatusChip';
import { UsersTableFilters } from './UsersTableFilters';
import { UsersTablePagination } from './UsersTablePagination';

const ROW_HEIGHT = 56;

/**
 * Map a Keycloak user object to the table row shape.
 */
const mapKeycloakUserToRow = (user, lastLoginMap) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'N/A';
  const platformRoles = user.isPlatformAdmin ? ['Admin'] : ['User'];
  const orgNames = user.resourcePermissions?.organizations
    ? Object.values(user.resourcePermissions.organizations)
        .filter((o) => o.role !== 'none')
        .map((o) => o.name)
    : [];
  const lastLoginTs = lastLoginMap[user.id];
  const lastLogin = lastLoginTs ? new Date(lastLoginTs) : null;
  const status = user.enabled === false ? 'Suspended' : 'Active';

  return {
    id: user.id,
    name: fullName,
    email: user.email || '',
    platformRoles,
    organizations: orgNames,
    lastLogin,
    status,
  };
};

export const UsersTable = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const keycloakUsers = useUsersList();
  const lastLoginMap = useLastLoginMap();
  const currentUserRoles = useUserRoles();
  const isPlatformAdmin = currentUserRoles?.includes(APP_ROLES.PlatformAdmin);

  const [filters, setFilters] = useState({ name: '', email: '', role: '', org: '', status: '' });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Map Keycloak users to table rows
  const allRows = useMemo(
    () => keycloakUsers.map((u) => mapKeycloakUserToRow(u, lastLoginMap)),
    [keycloakUsers, lastLoginMap]
  );

  const rows = useMemo(() => {
    return allRows.filter((u) => {
      if (filters.name && !u.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.email && !u.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.role && !u.platformRoles.join(' ').toLowerCase().includes(filters.role.toLowerCase())) return false;
      if (filters.org && !u.organizations.join(' ').toLowerCase().includes(filters.org.toLowerCase())) return false;
      if (filters.status && !u.status.toLowerCase().includes(filters.status.toLowerCase())) return false;
      return true;
    });
  }, [allRows, filters]);

  const pagedRows = useMemo(() => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [rows, page]);

  const isSelected = (id) => selected.includes(id);

  const toggleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((r) => r.id));
    } else {
      setSelected([]);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleFilterChange = (key, value) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          {t('navigation.users')}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {t('users.subtitle')}
        </Typography>
        {isPlatformAdmin && (
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: 1 }}
              onClick={() => {
                // TODO: Implement add new user functionality
                console.warn('Add new user functionality not yet implemented');
              }}
            >
              {t('users.addNewUser')}
            </Button>
            <Button
              variant="outlined"
              sx={{ borderRadius: 1, color: theme.palette.text.primary }}
              onClick={() => {
                // TODO: Implement batch invite functionality
                console.warn('Batch invite functionality not yet implemented');
              }}
            >
              {t('users.batchInvite')}
            </Button>
          </Box>
        )}
      </Box>

      <Paper variant="outlined">
        {isPlatformAdmin && <BulkActionsToolbar selectedCount={selected.length} />}
        <TableContainer>
          <Table sx={{ minWidth: 900 }} size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    onChange={toggleSelectAll}
                    checked={rows.length > 0 && selected.length === rows.length}
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Platform Roles</TableCell>
                <TableCell>Organizations</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Status</TableCell>
                {isPlatformAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>

              <UsersTableFilters filters={filters} onChange={handleFilterChange} />
            </TableHead>

            <TableBody>
              {pagedRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    height: ROW_HEIGHT,
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={isSelected(row.id)} onChange={() => toggleSelect(row.id)} />
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>{row.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>{row.email}</TableCell>
                  <TableCell>{row.platformRoles.join(', ')}</TableCell>
                  <TableCell>{row.organizations.join(', ')}</TableCell>
                  <TableCell>
                    {row.lastLogin ? new Date(row.lastLogin).toLocaleString() : t('users.lastLogin.unavailable')}
                  </TableCell>
                  <TableCell>
                    <UserStatusChip status={row.status} />
                  </TableCell>
                  {isPlatformAdmin && (
                    <TableCell align="right">
                      <UserActions
                        onManage={() => {
                          // TODO: Implement manage user functionality
                          console.warn('Manage user functionality not yet implemented', row.id);
                        }}
                        onDelete={() => {
                          // TODO: Implement delete user functionality
                          console.warn('Delete user functionality not yet implemented', row.id);
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {pagedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isPlatformAdmin ? 8 : 7} align="center" sx={{ py: 4 }}>
                    <Typography sx={{ color: theme.palette.text.secondary }}>{t('users.empty')}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <UsersTablePagination
          count={rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Paper>
    </Box>
  );
};
