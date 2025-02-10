// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Auth } from '@cosmotech/core';

const getAuthenticationHeaders = async (allowApiKey = false) => {
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

export { axiosClientApi as clientApi, getAuthenticationHeaders };
