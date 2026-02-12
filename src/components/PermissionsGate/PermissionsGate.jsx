// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';

/**
 * PermissionsGate - Declarative component for permission-based UI gating.
 *
 * Renders children only if the user has ALL required permissions.
 * Optionally renders a fallback (or nothing) when permission is denied.
 *
 * Usage:
 *   <PermissionsGate userPermissions={currentUserPermissions} requiredPermissions={['write', 'delete']}>
 *     <DeleteButton />
 *   </PermissionsGate>
 *
 *   <PermissionsGate
 *     userPermissions={currentUserPermissions}
 *     requiredPermissions={['write_security']}
 *     RenderNoPermissionComponent={() => <Typography>Access denied</Typography>}
 *   >
 *     <SecuritySettings />
 *   </PermissionsGate>
 */
export const PermissionsGate = ({
  children,
  userPermissions = [],
  requiredPermissions = [],
  RenderNoPermissionComponent = null,
  noPermissionProps = {},
}) => {
  const hasPermission =
    requiredPermissions.length === 0 ||
    requiredPermissions.every((permission) => userPermissions.includes(permission));

  if (!hasPermission) {
    console.debug(
      `[PermissionsGate] Access denied. Required: [${requiredPermissions.join(', ')}], Has: [${userPermissions.join(', ')}]`
    );
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (RenderNoPermissionComponent) {
    return <RenderNoPermissionComponent {...noPermissionProps} />;
  }

  return null;
};

PermissionsGate.propTypes = {
  /** The content to render when the user has the required permissions */
  children: PropTypes.node.isRequired,
  /** Array of permission strings the current user has */
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  /** Array of permission strings required to render children (ALL must match) */
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  /** Component to render when the user does NOT have the required permissions */
  RenderNoPermissionComponent: PropTypes.elementType,
  /** Props to pass to the no-permission component */
  noPermissionProps: PropTypes.object,
};

/**
 * PermissionsGateAny - Like PermissionsGate but requires ANY (at least one) of the listed permissions.
 */
export const PermissionsGateAny = ({
  children,
  userPermissions = [],
  requiredPermissions = [],
  RenderNoPermissionComponent = null,
  noPermissionProps = {},
}) => {
  const hasPermission =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => userPermissions.includes(permission));

  if (!hasPermission) {
    console.debug(
      `[PermissionsGateAny] Access denied. Required any of: [${requiredPermissions.join(', ')}], Has: [${userPermissions.join(', ')}]`
    );
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (RenderNoPermissionComponent) {
    return <RenderNoPermissionComponent {...noPermissionProps} />;
  }

  return null;
};

PermissionsGateAny.propTypes = {
  children: PropTypes.node.isRequired,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  RenderNoPermissionComponent: PropTypes.elementType,
  noPermissionProps: PropTypes.object,
};

/**
 * Default "Access Denied" fallback component.
 */
export const AccessDeniedFallback = ({ message = 'You do not have permission to view this content.' }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography color="text.secondary" variant="body1">
      {message}
    </Typography>
  </Box>
);

AccessDeniedFallback.propTypes = {
  message: PropTypes.string,
};
