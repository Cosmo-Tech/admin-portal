// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import { UserStatusGate } from './components/UserStatusGate/UserStatusGate.jsx';
import { Organizations } from './views/Organizations.jsx';
import { Scenarios } from './views/Scenarios.jsx';
import { Solutions } from './views/Solutions.jsx';
import { Users } from './views/Users/Users.jsx';
import { Workspaces } from './views/Workspaces.jsx';

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
