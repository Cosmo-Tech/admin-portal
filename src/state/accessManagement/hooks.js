// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import saveAclAssignments from './thunks/saveAclAssignments.js';

export const useSaveAclAssignments = () => {
  const dispatch = useDispatch();
  return useCallback((pendingOperations) => dispatch(saveAclAssignments(pendingOperations)), [dispatch]);
};
