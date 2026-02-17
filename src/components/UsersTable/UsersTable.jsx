// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useUsersList, useDeleteKeycloakUser } from 'src/state/users/hooks.js';
import { AddUserDialog } from './AddUserDialog';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { UserActions } from './UserActions';
import { UserStatusChip } from './UserStatusChip';
import { UsersTableFilters } from './UsersTableFilters';
import { UsersTablePagination } from './UsersTablePagination';

const ROW_HEIGHT = 56;

/** Deterministic hash → index for a string. */
const hashToIndex = (str, max) => {
  if (!str || max <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.codePointAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
};

/** Get avatar background color from the theme palette. */
const getAvatarColor = (name, avatarColors, fallbackColor) => {
  const palette = avatarColors?.length > 0 ? avatarColors : fallbackColor ? [fallbackColor] : [];
  if (palette.length === 0) return undefined;
  if (!name) return palette[0];
  return palette[hashToIndex(name, palette.length)];
};

/** Extract initials from a full name. */
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

/**
 * Map a Keycloak user object to the table row shape.
 */
const mapKeycloakUserToRow = (user) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'N/A';
  const platformRoles = user.isPlatformAdmin ? ['Admin'] : ['User'];
  const status = user.enabled === false ? 'Suspended' : 'Active';

  return {
    id: user.id,
    name: fullName,
    email: user.email || '',
    platformRoles,
    status,
  };
};

export const UsersTable = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const keycloakUsers = useUsersList();
  const currentUserRoles = useUserRoles();
  const isPlatformAdmin = currentUserRoles?.includes(APP_ROLES.PlatformAdmin);
  const deleteUser = useDeleteKeycloakUser();

  const amColors = theme.palette.accessManagement || {};
  const avatarColors = amColors.avatarColors;
  const avatarFallbackColor = amColors.avatarFallbackBg || theme.palette.secondary.dark;

  const [filters, setFilters] = useState({ name: '', email: '', role: '', status: '' });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const rowsPerPage = 10;

  // Map Keycloak users to table rows
  const allRows = useMemo(() => keycloakUsers.map((u) => mapKeycloakUserToRow(u)), [keycloakUsers]);

  const rows = useMemo(() => {
    return allRows.filter((u) => {
      if (filters.name && !u.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.email && !u.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.role && !u.platformRoles.join(' ').toLowerCase().includes(filters.role.toLowerCase())) return false;
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

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setSelected((prev) => prev.filter((id) => id !== deleteTarget.id));
    } catch (err) {
      const message = err?.message || t('users.deleteDialog.error');
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteUser, t]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
    setDeleteError(null);
  }, []);

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
              onClick={() => setAddDialogOpen(true)}
            >
              {t('users.addNewUser')}
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
                <TableCell>Platform Role</TableCell>
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          bgcolor: getAvatarColor(row.name, avatarColors, avatarFallbackColor),
                          color: amColors.avatarText || '#FFFFFF',
                        }}
                      >
                        {getInitials(row.name)}
                      </Avatar>
                      <Typography sx={{ color: theme.palette.text.primary, fontWeight: 700, fontSize: '0.875rem' }}>
                        {row.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>{row.email}</TableCell>
                  <TableCell>{row.platformRoles.join(', ')}</TableCell>
                  <TableCell>
                    <UserStatusChip status={row.status} />
                  </TableCell>
                  {isPlatformAdmin && (
                    <TableCell align="right">
                      <UserActions
                        onManage={() => {
                          console.warn('Manage user functionality not yet implemented', row.id);
                        }}
                        onDelete={() => setDeleteTarget({ id: row.id, name: row.name })}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {pagedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isPlatformAdmin ? 6 : 5} align="center" sx={{ py: 4 }}>
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

      {isPlatformAdmin && <AddUserDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />}

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={isDeleting ? undefined : handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          {t('users.deleteDialog.title')}
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            <Trans
              i18nKey="users.deleteDialog.message"
              values={{ name: deleteTarget?.name }}
              components={{ strong: <strong /> }}
            />
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} disabled={isDeleting} sx={{ color: theme.palette.text.primary }}>
            {t('users.deleteDialog.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{ minWidth: 100 }}
          >
            {isDeleting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                {t('users.deleteDialog.deleting')}
              </Box>
            ) : (
              t('users.deleteDialog.confirm')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
