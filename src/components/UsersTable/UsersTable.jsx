// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
import { PrincipalTypeChip } from './UserStatusChip';
import { UsersTableFilters } from './UsersTableFilters';
import { UsersTablePagination } from './UsersTablePagination';

const ROW_HEIGHT = 56;

export const UsersTable = ({ users = [], isLoading = false, error = null }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ name: '', role: '', type: '' });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const rows = useMemo(() => {
    return users.filter((u) => {
      if (filters.name && !u.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.role && !u.platformRoles.join(' ').toLowerCase().includes(filters.role.toLowerCase())) return false;
      if (filters.type && !u.principalType.toLowerCase().includes(filters.type.toLowerCase())) return false;
      return true;
    });
  }, [users, filters]);

  const pagedRows = useMemo(() => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [rows, page]);

  const isSelected = (id) => selected.indexOf(id) !== -1;

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {t('users.fetchError')}: {error.message || JSON.stringify(error)}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          {t('users.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {t('users.subtitle')}
        </Typography>
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
            {t('users.addUser')}
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
      </Box>

      <Paper variant="outlined">
        <BulkActionsToolbar selectedCount={selected.length} />
        <TableContainer>
          <Table sx={{ minWidth: 700 }} size="medium">
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
                <TableCell sx={{ fontWeight: 700 }}>{t('users.columns.name')}</TableCell>
                <TableCell>{t('users.columns.platformRoles')}</TableCell>
                <TableCell>{t('users.columns.type')}</TableCell>
                <TableCell>{t('users.columns.assignedDate')}</TableCell>
                <TableCell align="right">{t('users.columns.actions')}</TableCell>
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
                  <TableCell>{row.platformRoles.join(', ')}</TableCell>
                  <TableCell>
                    <PrincipalTypeChip type={row.principalType} />
                  </TableCell>
                  <TableCell>{row.assignedDate ? new Date(row.assignedDate).toLocaleDateString() : '—'}</TableCell>
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
                </TableRow>
              ))}

              {pagedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {t('users.noResults')}
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

UsersTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      principalType: PropTypes.string.isRequired,
      platformRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
      assignedDate: PropTypes.string,
    })
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.object,
};
