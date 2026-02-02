// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import PropTypes from 'prop-types';
import { Chip, useTheme } from '@mui/material';

export const UserStatusChip = ({ status }) => {
  const theme = useTheme();
  const normalized = (status || '').toLowerCase();

  if (normalized === 'active') {
    return (
      <Chip
        label="Active"
        sx={{ backgroundColor: theme.palette.success.main, color: theme.palette.common.white, height: 28 }}
      />
    );
  }
  if (normalized === 'suspended') {
    return (
      <Chip
        label="Suspended"
        sx={{ backgroundColor: theme.palette.warning.main, color: theme.palette.common.white, height: 28 }}
      />
    );
  }
  return <Chip label={status} />;
};

UserStatusChip.propTypes = {
  status: PropTypes.string,
};
