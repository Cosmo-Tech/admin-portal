// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import {
  addAuthProvider as addAzureAuthProvider,
  resetAuthProviderConfig as resetAzureAuthProviderConfig,
} from '../auth/azure';
import {
  addAuthProvider as addKeycloakAuthProvider,
  resetAuthProviderConfig as resetKeycloakAuthProviderConfig,
} from '../auth/keycloak';
import { getApiClient } from './apiClient';
import { apiConfig } from './apiConfig';
import { detectApiAuthProviderType } from './apiUtils';

class ApiManager {
  #api = null;
  #apiClient = null;
  #apiConfig = null;

  constructor() {
    this.#api = null;
    this.#apiConfig = apiConfig;
    this.#initAuthProvidersFromApis();
    this.#selectApiFromLocalStorage();
  }

  #initAuthProvidersFromApis = () => {
    const apis = this.#apiConfig.getApis();
    Object.entries(apis).forEach(([apiName, api]) => {
      const authProviderType = detectApiAuthProviderType(api);
      if (authProviderType === 'azure') addAzureAuthProvider(apiName, api);
      else if (authProviderType === 'keycloak') addKeycloakAuthProvider(apiName, api);
      else {
        console.warn(`Unknown auth provider type for api "${apiName}"`);
      }
    });
  };

  #selectApiFromLocalStorage = () => {
    const apis = this.#apiConfig.getApis();
    const preselectedAuthProvider = localStorage.getItem('authProvider');
    if (preselectedAuthProvider && preselectedAuthProvider in apis) {
      this.selectApi(preselectedAuthProvider, apis[preselectedAuthProvider]);
      const authProviderType = detectApiAuthProviderType(this.#api);

      if (authProviderType === 'azure') resetAzureAuthProviderConfig(preselectedAuthProvider, this.#api);
      else if (authProviderType === 'keycloak') resetKeycloakAuthProviderConfig(preselectedAuthProvider, this.#api);
      else {
        console.warn(`Unknown auth provider type for api "${preselectedAuthProvider}"`);
      }
    }
  };

  getApis = () => this.#apiConfig.getApis();
  // TODO: add method to add a new API dynamically

  selectApi = (apiName, api) => {
    this.#api = api;
    this.#apiClient = getApiClient(this.#api.COSMOTECH_API_PATH);
    // TODO: store selected api (and its config?) in local storage
  };
  getApi = () => this.#api;
  getApiClient = () => this.#apiClient;
  getAuthProviderType = () => detectApiAuthProviderType(this.#api);
}

export const apiManager = new ApiManager();
Object.freeze(apiManager);
