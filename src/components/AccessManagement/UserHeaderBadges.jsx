// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const toTitleCase = (value) =>
  String(value || '')
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const getPrimaryUserRoleLabel = (user, t) => {
  if (!user) return t('accessManagement.platformRoles.user');
  if (user.isPlatformAdmin === true) return t('accessManagement.platformRoles.platformAdmin');

  const realmRoles = Array.isArray(user.realmRoles) ? user.realmRoles : [];
  if (realmRoles.length === 0) return t('accessManagement.platformRoles.user');

  const platformRole = realmRoles.find((role) => String(role || '').toLowerCase() === 'platform.admin');
  if (platformRole) return t('accessManagement.platformRoles.platformAdmin');

  return toTitleCase(realmRoles[0]);
};

export const UserHeaderBadges = ({ user, assignedRolesCount, t, theme }) => {
  const amColors = theme.palette.accessManagement || {};
  const roleLabel = getPrimaryUserRoleLabel(user, t);
  const fontFamily = amColors.fontFamily || theme.typography.fontFamily;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 34,
          px: 1.2,
          borderRadius: 1,
          border: `1px solid ${amColors.scopeButtonSelectedBorder || theme.palette.secondary.main}`,
          bgcolor: amColors.scopeButtonSelectedBg || theme.palette.action.selected,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: amColors.scopeButtonSelectedText || theme.palette.secondary.main,
            letterSpacing: 0.2,
            fontFamily,
          }}
        >
          {roleLabel}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: amColors.assignedRolesChipText || theme.palette.text.secondary,
          fontFamily,
        }}
      >
        {assignedRolesCount} {t('accessManagement.assignedRoles')}
      </Typography>
    </Box>
  );
};

UserHeaderBadges.propTypes = {
  user: PropTypes.object,
  assignedRolesCount: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    palette: PropTypes.object.isRequired,
    typography: PropTypes.object.isRequired,
  }).isRequired,
};
