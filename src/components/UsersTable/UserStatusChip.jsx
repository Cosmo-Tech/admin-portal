// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Chip, useTheme } from '@mui/material';

export const PrincipalTypeChip = ({ type }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const normalized = (type || '').toLowerCase();

  if (normalized === 'user') {
    return (
      <Chip
        label={t('users.type.user')}
        sx={{ backgroundColor: theme.palette.info.main, color: theme.palette.common.white, height: 28 }}
      />
    );
  }
  if (normalized === 'group') {
    return (
      <Chip
        label={t('users.type.group')}
        sx={{ backgroundColor: theme.palette.secondary.main, color: theme.palette.common.white, height: 28 }}
      />
    );
  }
  return <Chip label={type} sx={{ height: 28 }} />;
};

PrincipalTypeChip.propTypes = {
  type: PropTypes.string,
};

// Keep backward-compatible export
export const UserStatusChip = PrincipalTypeChip;
