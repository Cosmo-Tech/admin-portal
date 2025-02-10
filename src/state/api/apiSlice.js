// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const cosmoApi = createApi({
  reducerPath: 'cosmoApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getAllSolutions: builder.query({
      queryFn: async (args, api) => {
        const { Api } = api.extra;
        try {
          const { data } = await Api.Solutions.findAllSolutions('o-vloxvdke5gqvx');
          return { data };
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
    }),
    getAllScenarios: builder.query({
      queryFn: async (args, api) => {
        const { Api } = api.extra;
        try {
          const { data } = await Api.Runners.listRunners('o-vloxvdke5gqvx', 'w-314qryelkyop5', 0, 5000);
          const scenarios = data.filter((runner) => runner.ownerId === 'c12fe835-b8b0-4578-9343-dddeaecd0140');
          return { data: scenarios };
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
    }),
    renameScenario: builder.mutation({
      queryFn: async (args, api) => {
        const { Api } = api.extra;
        const { runnerId, patch } = args;
        try {
          const { data } = await Api.Runners.updateRunner('o-vloxvdke5gqvx', 'w-314qryelkyop5', runnerId, patch);
          return { data };
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            cosmoApi.util.updateQueryData('getAllScenarios', undefined, (draft) => {
              const index = draft.findIndex((scenario) => scenario.id === data.id);
              draft[index] = data;
            })
          );
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
    }),
  }),
});

export const { useGetAllSolutionsQuery, useGetAllScenariosQuery, useRenameScenarioMutation } = cosmoApi;
