// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, TextField, useTheme } from '@mui/material';

export default function UsersTableFilters({ filters, onChange }) {
  const theme = useTheme();

  return (
    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
      <TableCell />
      <TableCell>
        <TextField
          size="small"
          placeholder="Filter..."
          value={filters.name}
          onChange={(e) => onChange('name', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder="Filter..."
          value={filters.email}
          onChange={(e) => onChange('email', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder="Filter..."
          value={filters.role}
          onChange={(e) => onChange('role', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder="Filter..."
          value={filters.org}
          onChange={(e) => onChange('org', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell />
      <TableCell>
        <TextField
          size="small"
          placeholder="Filter..."
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell />
    </TableRow>
  );
}

UsersTableFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
