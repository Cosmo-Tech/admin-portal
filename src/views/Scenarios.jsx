// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React from 'react';
import { useForm } from 'react-hook-form';
import { useGetAllScenariosQuery, useRenameScenarioMutation } from '../state/api/apiSlice.js';

export const Scenarios = () => {
  const { register, handleSubmit } = useForm();
  const { data, isLoading } = useGetAllScenariosQuery();
  const [renameScenario, { error }] = useRenameScenarioMutation();
  const rename = (data) => {
    renameScenario(data);
  };
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  if (error) return <h1>Error!</h1>;
  return (
    <div>
      {data && (
        <ol>
          {data.map((scenario) => (
            <li key={scenario.id}>
              {scenario.id} - {scenario.name} - {scenario.runTemplateId}
            </li>
          ))}
        </ol>
      )}
      <form onSubmit={handleSubmit(rename)}>
        <input placeholder="id" {...register('runnerId')} />
        <input placeholder="name" {...register('patch.name')} />
        <input placeholder="runTemplateId" {...register('patch.runTemplateId')} />
        <input type="submit" value="rename" />
      </form>
    </div>
  );
};
