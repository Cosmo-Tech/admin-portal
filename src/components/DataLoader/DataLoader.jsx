// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useEffect } from 'react';
import { useFetchInitialData } from '../../state/app/hooks.js';
import { AUTH_STATUS } from '../../state/auth/constants.js';
import { useAuth } from '../../state/auth/hooks.js';

/**
 * DataLoader component watches for authentication status changes
 * and triggers initial data fetching when user becomes authenticated.
 */
export default function DataLoader() {
  const { status } = useAuth();
  const fetchInitialData = useFetchInitialData();

  useEffect(() => {
    if (status === AUTH_STATUS.AUTHENTICATED) {
      console.log('[DataLoader] Auth status changed to AUTHENTICATED, fetching initial data...');
      fetchInitialData();
    }
  }, [status, fetchInitialData]);

  // This component doesn't render anything
  return null;
}
