// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import React from 'react';
import { AuthKeycloakRedirect } from '@cosmotech/core';
import { useLogin } from '../../state/auth/hooks.js';

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
