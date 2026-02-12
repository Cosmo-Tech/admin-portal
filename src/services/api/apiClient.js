// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  DatasetApiFactory,
  RunnerApiFactory,
  RunApiFactory,
  SolutionApiFactory,
  WorkspaceApiFactory,
  OrganizationApiFactory,
} from '@cosmotech/api-ts-v3';
import {
  OrganizationApiFactory as OrganizationApiFactoryV5,
  MetaApiFactory as MetaApiFactoryV5,
} from '@cosmotech/api-ts-v5';
import { Auth } from '@cosmotech/core';

export const getAuthenticationHeaders = async (allowApiKey = false) => {
  // if (allowApiKey && process.env.REACT_APP_API_KEY) return { 'X-CSM-API-KEY': process.env.REACT_APP_API_KEY };

  let tokens = await Auth.acquireTokens();
  if (tokens?.accessToken) {
    const accessData = jwtDecode(tokens.accessToken);
    const expiryDate = accessData.exp;
    const remainingTimeInMinutes = Math.floor((expiryDate - Date.now() / 1000) / 60);
    if (remainingTimeInMinutes <= 3) {
      tokens = await Auth.refreshTokens();
    }
    if (tokens?.accessToken) return { Authorization: 'Bearer ' + tokens.accessToken };

    Auth.signOut();
  }
};

const addInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    async (request) => {
      const authenticationHeaders = await getAuthenticationHeaders(true);
      request.headers = {
        ...request.headers,
        ...authenticationHeaders,
      };
      return request;
    },
    (error) => {
      console.error(error);
    }
  );
  return axiosInstance;
};

const axiosClientApi = addInterceptors(axios.create());

/**
 * Derive the v5-compatible base URL from a potentially versioned API URL.
 * e.g. "https://api.example.com/platform/v3" => "https://api.example.com/platform/v5"
 * If the URL already contains /v5, it is used as-is.
 */
const deriveV5ApiUrl = (apiUrl) => {
  return apiUrl.replace(/\/v\d[^/]*$/, '/v5');
};

export const getApiClient = (apiUrl) => {
  const v5ApiUrl = deriveV5ApiUrl(apiUrl);

  return {
    apiUrl,
    // v3 API factories
    Solutions: SolutionApiFactory(null, apiUrl, axiosClientApi),
    Datasets: DatasetApiFactory(null, apiUrl, axiosClientApi),
    Runners: RunnerApiFactory(null, apiUrl, axiosClientApi),
    RunnerRuns: RunApiFactory(null, apiUrl, axiosClientApi),
    Workspaces: WorkspaceApiFactory(null, apiUrl, axiosClientApi),
    Organizations: OrganizationApiFactory(null, apiUrl, axiosClientApi),
    // v5 API factories (for permissions and meta endpoints)
    OrganizationsV5: OrganizationApiFactoryV5(null, v5ApiUrl, axiosClientApi),
    MetaV5: MetaApiFactoryV5(null, v5ApiUrl, axiosClientApi),
  };
};
