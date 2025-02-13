// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useEffect } from 'react';
import { AppBar } from '../components';
import {
  useGetAllOrganizations,
  useOrganizationsList,
  useOrganizationsListStatus,
} from '../state/organizations/hooks.js';

export const Organizations = () => {
  const getAllOrganizations = useGetAllOrganizations();
  const organizations = useOrganizationsList();
  const organizationsStatus = useOrganizationsListStatus();

  useEffect(() => {
    getAllOrganizations();
  }, [getAllOrganizations]);

  if (organizationsStatus === 'LOADING') return <h1>Loading...</h1>;
  return (
    <div>
      <AppBar />
      {organizations && organizationsStatus !== 'LOADING' && (
        <ol>
          {organizations.map((organizations) => (
            <li key={organizations.id}>{organizations.name}</li>
          ))}
        </ol>
      )}
    </div>
  );
};
