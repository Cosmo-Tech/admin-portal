// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Outlet } from 'react-router';
import { AppBar } from '../components';

export const ResourcesLayout = () => {
  return (
    <div>
      <AppBar />
      <h1>Resources</h1>
      <Outlet />
    </div>
  );
};
