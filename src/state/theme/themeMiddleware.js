// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

/**
 * Middleware to persist theme mode changes to localStorage.
 * This separates side effects from pure reducer logic, following Redux best practices.
 */
export const themeMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Persist to localStorage after theme actions are processed
  if (action.type === 'theme/setThemeMode' || action.type === 'theme/toggleThemeMode') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const { theme } = store.getState();
        localStorage.setItem('themeMode', theme.mode);
      }
    } catch (error) {
      console.error('Failed to persist theme to localStorage:', error);
    }
  }

  return result;
};
