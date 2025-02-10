// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useAuth, useAuthStatus } from '../../state/auth/hooks.js';

export const useUserStatusGateHook = () => {
  const authStatus = useAuthStatus();
  const auth = useAuth();

  return { authStatus, auth };
};
