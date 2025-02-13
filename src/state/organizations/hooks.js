// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getAllOrganizations from './thunks/getAllOrganizations.js';

export const useGetAllOrganizations = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(getAllOrganizations()), [dispatch]);
};

export const useOrganizationsList = () => {
  return useSelector((state) => state.organizations.list);
};

export const useOrganizationsListStatus = () => {
  return useSelector((state) => state.organizations.status);
};

export const useSolutions = () => {
  return useSelector((state) => state.solutions);
};
