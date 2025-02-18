// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { useUserStatusGateHook } from './UserStatusGateHook.js';

export const UserStatusGate = ({ children }) => {
  const { authenticated } = useUserStatusGateHook();
  const location = useLocation();

  if (!authenticated && location.pathname !== '/sign-in') return <Navigate to="/sign-in" replace />;
  if (authenticated && location.pathname === '/sign-in') return <Navigate to="/" replace />;
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
};

UserStatusGate.propTypes = {
  children: PropTypes.node,
};
