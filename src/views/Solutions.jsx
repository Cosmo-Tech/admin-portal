// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { AppBar } from '../components/AppBar/AppBar.jsx';
import { useGetAllSolutionsQuery } from '../state/api/apiSlice.js';

export const Solutions = () => {
  const { data, isLoading } = useGetAllSolutionsQuery();
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  return (
    <div>
      <AppBar />
      {data && (
        <ol>
          {data.map((solution) => (
            <li key={solution.id}>{solution.name}</li>
          ))}
        </ol>
      )}
    </div>
  );
};
