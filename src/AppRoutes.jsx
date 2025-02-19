// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { UserStatusGate } from './components';
import { Login, Organizations, ResourcesLayout, Scenarios, Solutions, Users, Workspaces } from './views';

const AppRoutes = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<UserStatusGate />}>
          <Route element={<ResourcesLayout />}>
            <Route index element={<Users />} />
            <Route path="solution" element={<Solutions />} />
            <Route path="workspace" element={<Workspaces />} />
            <Route path="organization" element={<Organizations />} />
            <Route path="scenario" element={<Scenarios />} />
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
