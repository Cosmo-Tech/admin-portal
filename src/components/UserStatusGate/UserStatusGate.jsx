// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import PropTypes from 'prop-types';
import { AUTH_STATUS } from '../../state/auth/constants.js';
import Login from '../../views/Login/index.js';
import { useUserStatusGateHook } from './UserStatusGateHook.js';

export const UserStatusGate = ({ children }) => {
  const { authStatus } = useUserStatusGateHook();
  const authenticated = authStatus === AUTH_STATUS.AUTHENTICATED || authStatus === AUTH_STATUS.DISCONNECTING;
  if (!authenticated) return <Login />;
  return children;
};
UserStatusGate.propTypes = {
  children: PropTypes.node,
};
