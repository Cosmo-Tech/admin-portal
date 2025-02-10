// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthData } from './reducers.js';
import { Login } from './thunks/Login.js';

export const useLogin = () => {
  const dispatch = useDispatch();
  return useCallback((provider) => dispatch(Login({ provider })), [dispatch]);
};

export const useAuthStatus = () => {
  return useSelector((state) => state.auth.status);
};

export const useAuth = () => {
  return useSelector((state) => state.auth);
};

export const useSetAuthData = () => {
  const dispatch = useDispatch();
  return useCallback((data) => dispatch(setAuthData(data)), [dispatch]);
};
