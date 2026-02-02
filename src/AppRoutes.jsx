// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { UserStatusGate } from './components';
import {
  Login,
  Organizations,
  ResourcesLayout,
  Scenarios,
  Solutions,
  Users,
  Workspaces,
  Dashboards,
  Resources,
  Roles,
} from './views';

const AppRoutes = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<UserStatusGate />}>
          <Route element={<ResourcesLayout />}>
            <Route index element={<Navigate to="/solution" replace />} />
            <Route path="users" element={<Users />} />
            <Route path="solution" element={<Solutions />} />
            <Route path="workspace" element={<Workspaces />} />
            <Route path="organization" element={<Organizations />} />
            <Route path="scenario" element={<Scenarios />} />
            <Route path="dashboards" element={<Dashboards />} />
            <Route path="resources" element={<Resources />} />
            <Route path="roles" element={<Roles />} />
          </Route>

          <Route path="sign-in" element={<Login />} />
        </Route>
      </>
    ),
    { basename: '' }
  );
  return <RouterProvider router={router} />;
};
export default AppRoutes;
