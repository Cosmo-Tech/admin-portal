// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
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
