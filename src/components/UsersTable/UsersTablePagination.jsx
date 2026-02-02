// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import PropTypes from 'prop-types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton, Typography, useTheme } from '@mui/material';

export default function UsersTablePagination({ count, page, rowsPerPage, onPageChange }) {
  const theme = useTheme();
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const start = count === 0 ? 0 : page * rowsPerPage + 1;
  const end = Math.min(count, (page + 1) * rowsPerPage);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2">{`${start} to ${end} of ${count}`}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">{`Page ${page + 1} of ${totalPages}`}</Typography>
        <IconButton size="small" disabled={page === 0} onClick={() => onPageChange(Math.max(0, page - 1))}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          size="small"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

UsersTablePagination.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
