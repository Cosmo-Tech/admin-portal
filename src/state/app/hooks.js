// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import fetchInitialData from './thunks/fetchInitialData.js';

// Selectors
export const useAppStatus = () => useSelector((state) => state.app.status);
export const useAppError = () => useSelector((state) => state.app.error);
export const useApiVersion = () => useSelector((state) => state.app.apiVersion);

// Action dispatchers
export const useFetchInitialData = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(fetchInitialData()), [dispatch]);
};
