// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { setOrganizations, setOrganizationsListStatus } from '../reducers.js';

function getAllOrganizations() {
  return async (dispatch, getState, extraArgument) => {
    dispatch(setOrganizationsListStatus({ status: 'LOADING' }));
    const { Api } = extraArgument;
    const { data } = await Api.Organizations.findAllOrganizations();
    dispatch(setOrganizations({ organizations: data }));
  };
}

export default getAllOrganizations;
