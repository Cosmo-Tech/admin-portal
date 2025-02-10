// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { useAuth, useAuthStatus } from '../../state/auth/hooks.js';

export const useUserStatusGateHook = () => {
  const authStatus = useAuthStatus();
  const auth = useAuth();

  return { authStatus, auth };
};
