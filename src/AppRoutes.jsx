// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { UserStatusGate } from './components';
import { Organizations, Scenarios, Solutions, Users, Workspaces } from './views';

const getLocationRelativePath = (path) => {
  const routerBasename = '';
  return path.startsWith(routerBasename) ? path.substring(routerBasename.length) : path;
};

const AppRoutes = () => {
  const relativePath = getLocationRelativePath('/');
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={
            <UserStatusGate>
              <Users />
            </UserStatusGate>
          }
        />
        <Route
          path="/solution"
          element={
            <UserStatusGate>
              <Solutions />
            </UserStatusGate>
          }
        />
        <Route
          path="/workspace"
          element={
            <UserStatusGate>
              <Workspaces />
            </UserStatusGate>
          }
        />
        <Route
          path="/organization"
          element={
            <UserStatusGate>
              <Organizations />
            </UserStatusGate>
          }
        />
        <Route
          path="/scenario"
          element={
            <UserStatusGate>
              <Scenarios />
            </UserStatusGate>
          }
        />
        <Route
          path="/sign-in"
          element={
            <UserStatusGate>
              <Navigate to={relativePath} />
            </UserStatusGate>
          }
        />
      </>
    ),
    { basename: '' }
  );
  return <RouterProvider router={router} />;
};
export default AppRoutes;
