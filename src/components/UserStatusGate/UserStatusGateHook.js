// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { AUTH_STATUS } from 'src/state/auth/constants.js';
import { useAuthStatus } from 'src/state/auth/hooks.js';

export const useUserStatusGateHook = () => {
  const authStatus = useAuthStatus();
  const authenticated = authStatus === AUTH_STATUS.AUTHENTICATED || authStatus === AUTH_STATUS.DISCONNECTING;

  return { authenticated };
};
