// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { Link } from 'react-router';

export const AppBar = () => {
  return (
    <div>
      <div>
        <Link to={'/'}>Users</Link>
      </div>
      <div>
        <Link to={'/solution'}>Solutions</Link>
      </div>
      <div>
        <Link to={'/workspace'}>Workspaces</Link>
      </div>
      <div>
        <Link to={'/organization'}>Organizations</Link>
      </div>
      <div>
        <Link to={'/scenario'}>Scenarios</Link>
      </div>
    </div>
  );
};
