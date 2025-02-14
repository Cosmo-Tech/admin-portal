// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import APIS from 'src/config/apis.json';
import { validateApis } from './apiUtils';

class ApiConfig {
  #apis = null;

  constructor() {
    this.#apis = validateApis(APIS);
  }

  getApis = () => this.#apis;
}

export const apiConfig = new ApiConfig();
Object.freeze(apiConfig);
