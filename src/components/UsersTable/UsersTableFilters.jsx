// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { TableRow, TableCell, TextField, useTheme } from '@mui/material';

export const UsersTableFilters = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
      <TableCell />
      <TableCell>
        <TextField
          size="small"
          placeholder={t('filter.placeholder')}
          value={filters.name}
          onChange={(e) => onChange('name', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder={t('filter.placeholder')}
          value={filters.email}
          onChange={(e) => onChange('email', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder={t('filter.placeholder')}
          value={filters.role}
          onChange={(e) => onChange('role', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder={t('filter.placeholder')}
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell />
    </TableRow>
  );
};

UsersTableFilters.propTypes = {
  filters: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
