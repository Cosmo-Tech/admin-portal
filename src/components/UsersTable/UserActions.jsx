// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, IconButton } from '@mui/material';

export const UserActions = ({ onManage, onDelete }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Button variant="outlined" sx={{ borderRadius: 1, color: 'text.primary' }} onClick={onManage}>
        {t('userActions.manage')}
      </Button>
      <IconButton color="error" onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

UserActions.propTypes = {
  onManage: PropTypes.func,
  onDelete: PropTypes.func,
};
