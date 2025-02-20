// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { useIsAuthenticated } from 'src/state/auth/hooks.js';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

export const UserStatusGate = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated && location.pathname !== '/sign-in') return <Navigate to="/sign-in" replace />;
  if (isAuthenticated && location.pathname === '/sign-in') return <Navigate to="/" replace />;
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
};

UserStatusGate.propTypes = {
  children: PropTypes.node,
};
