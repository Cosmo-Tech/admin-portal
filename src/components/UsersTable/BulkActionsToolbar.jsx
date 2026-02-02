// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Paper, Typography, useTheme } from '@mui/material';

export const BulkActionsToolbar = ({ selectedCount = 0 }) => {
  const theme = useTheme();
  if (selectedCount === 0) return null;
  return (
    <Paper elevation={0} sx={{ p: 1, bgcolor: '#fff', borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 14 }}>{selectedCount} selected</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1 }}
            onClick={() => {
              // TODO: Implement add users to group functionality
              console.warn('Add to group functionality not yet implemented');
            }}
          >
            Add to Group
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ borderRadius: 1 }}
            onClick={() => {
              // TODO: Implement bulk delete users functionality
              console.warn('Bulk delete functionality not yet implemented');
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

BulkActionsToolbar.propTypes = {
  selectedCount: PropTypes.number,
};
