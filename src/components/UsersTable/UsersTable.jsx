// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useMemo, useState } from 'react';
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
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { UserActions } from './UserActions';
import { UserStatusChip } from './UserStatusChip';
import { UsersTableFilters } from './UsersTableFilters';
import { UsersTablePagination } from './UsersTablePagination';
import mockUsers from './mockUsers';

const ROW_HEIGHT = 56;

export const UsersTable = () => {
  const theme = useTheme();
  const [filters, setFilters] = useState({ name: '', email: '', role: '', org: '', status: '' });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const rows = useMemo(() => {
    const normalized = mockUsers.filter((u) => {
      if (filters.name && !u.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.email && !u.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.role && !u.platformRoles.join(' ').toLowerCase().includes(filters.role.toLowerCase())) return false;
      if (filters.org && !u.organizations.join(' ').toLowerCase().includes(filters.org.toLowerCase())) return false;
      if (filters.status && !u.status.toLowerCase().includes(filters.status.toLowerCase())) return false;
      return true;
    });
    return normalized;
  }, [filters]);

  const pagedRows = useMemo(() => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [rows, page]);

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const toggleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(pagedRows.map((r) => r.id));
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
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Workspace Name &gt; Users
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          Users
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Manage workspace users and permissions
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ borderRadius: 1 }}
            onClick={() => console.log('Add New User')}
          >
            Add New User
          </Button>
          <Button
            variant="outlined"
            sx={{ borderRadius: 1, color: theme.palette.text.primary }}
            onClick={() => console.log('Batch Invite')}
          >
            Batch Invite
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined">
        <BulkActionsToolbar selectedCount={selected.length} />
        <TableContainer>
          <Table sx={{ minWidth: 900 }} size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    onChange={toggleSelectAll}
                    checked={pagedRows.length > 0 && selected.length === pagedRows.length}
                    indeterminate={selected.length > 0 && selected.length < pagedRows.length}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Platform Roles</TableCell>
                <TableCell>Organizations</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                    '&:hover': { backgroundColor: '#F8F9FA' },
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
                  <TableCell>{new Date(row.lastLogin).toLocaleString()}</TableCell>
                  <TableCell>
                    <UserStatusChip status={row.status} />
                  </TableCell>
                  <TableCell align="right">
                    <UserActions
                      onManage={() => console.log('Manage', row.id)}
                      onDelete={() => console.log('Delete', row.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {pagedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      No users match the current filters.
                    </Typography>
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
