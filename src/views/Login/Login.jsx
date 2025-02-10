// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import React from 'react';
import { useLogin } from 'src/state/auth/hooks.js';
import { AuthKeycloakRedirect } from '@cosmotech/core';

const Login = () => {
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
export default Login;
