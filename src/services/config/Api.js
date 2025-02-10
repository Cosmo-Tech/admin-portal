// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import {
  DatasetApiFactory,
  RunnerApiFactory,
  RunApiFactory,
  SolutionApiFactory,
  WorkspaceApiFactory,
  OrganizationApiFactory,
} from '@cosmotech/api-ts';
import { clientApi } from '../ClientApi';

const defaultBasePath = 'https://kubernetes.cosmotech.com/cosmotech-api/brewery/v4'.replace(/\/+$/, '');

export const Api = {
  defaultBasePath,
  Solutions: SolutionApiFactory(null, defaultBasePath, clientApi),
  Datasets: DatasetApiFactory(null, defaultBasePath, clientApi),
  Runners: RunnerApiFactory(null, defaultBasePath, clientApi),
  RunnerRuns: RunApiFactory(null, defaultBasePath, clientApi),
  Workspaces: WorkspaceApiFactory(null, defaultBasePath, clientApi),
  Organizations: OrganizationApiFactory(null, defaultBasePath, clientApi),
};
