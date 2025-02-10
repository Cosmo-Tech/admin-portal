// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getAllOrganizations from './thunks/GetAllOrganizations.js';

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
