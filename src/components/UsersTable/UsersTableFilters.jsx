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
          value={filters.role}
          onChange={(e) => onChange('role', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          placeholder={t('filter.placeholder')}
          value={filters.type}
          onChange={(e) => onChange('type', e.target.value)}
          fullWidth
        />
      </TableCell>
      <TableCell />
      <TableCell />
    </TableRow>
  );
};

UsersTableFilters.propTypes = {
  filters: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
