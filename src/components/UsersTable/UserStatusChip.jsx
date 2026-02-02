// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@mui/material';

export default function UserStatusChip({ status }) {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'active') {
    return <Chip label="Active" sx={{ backgroundColor: '#4CAF50', color: '#fff', height: 28 }} />;
  }
  if (normalized === 'suspended') {
    return <Chip label="Suspended" sx={{ backgroundColor: '#FFA726', color: '#fff', height: 28 }} />;
  }
  return <Chip label={status} />;
}

UserStatusChip.propTypes = {
  status: PropTypes.string,
};
