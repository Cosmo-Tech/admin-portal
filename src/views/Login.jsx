// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useLogin } from 'src/state/auth/hooks.js';
import { AuthKeycloakRedirect } from '@cosmotech/core';

export const Login = () => {
  const login = useLogin();
  const handleLogin = (event, provider) => {
    event.preventDefault();
    login(provider);
  };
  return (
    <div>
      <button onClick={(event) => handleLogin(event, AuthKeycloakRedirect.name)}>Login</button>
    </div>
  );
};
