// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleThemeMode, setThemeMode } from './reducers.js';

export const useThemeMode = () => {
  return useSelector((state) => state.theme.mode);
};

export const useToggleTheme = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(toggleThemeMode()), [dispatch]);
};

export const useSetThemeMode = () => {
  const dispatch = useDispatch();
  return useCallback((mode) => dispatch(setThemeMode(mode)), [dispatch]);
};
