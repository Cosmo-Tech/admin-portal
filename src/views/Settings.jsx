// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';

export const Settings = () => {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        borderColor: theme.palette.border.subtle,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h5" sx={{ mb: 1 }}>
        Settings
      </Typography>
      <Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Settings content will be available in this section.
        </Typography>
      </Box>
    </Paper>
  );
};
