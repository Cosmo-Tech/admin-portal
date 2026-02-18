<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Keycloak Configuration Required by Admin Portal

This document describes the exact Keycloak setup required by the app.

## 1) App values to match exactly

- Client ID: `cosmotech-webapp-client`
- JWT claim used by the app for platform roles: `userRoles`
- Existing realm role names expected by the app:
  - `Platform.Admin`
  - `Organization.Admin`
  - `Organization.Collaborator`
  - `Organization.Modeler`
  - `Organization.User`
  - `Organization.Viewer`

References:

- `src/config/apis.json`
- `src/services/config/accessControl/Roles.js`

## 2) Configure `Platform.Admin` as composite role

1. Go to `Realm roles`.
2. Open role `Platform.Admin`.
3. Enable `Composite roles`.
4. Go to `Associated roles`.
5. Click `Add associated roles`.
6. Select client `realm-management`.
7. Add these client roles:
   - `view-users` (required to list users)
   - `view-events` (required to read login events / last login)
   - `manage-users` (required to create and delete users)
   - `query-users` (required for user lookup flows)
   - `view-realm` (required to read realm role definitions)
   - `map-roles` (required to assign `Platform.Admin` to users)

References:

- `src/state/users/thunks/fetchRealmUsers.js`
- `src/state/users/thunks/createKeycloakUser.js`
- `src/state/users/thunks/deleteKeycloakUser.js`

## 3) Expose roles in JWT claim `userRoles`

The portal reads platform roles from the `userRoles` claim.

1. Go to `Clients`.
2. Open `cosmotech-webapp-client`.
3. Add a mapper (directly on client or through an assigned client scope):
   - Mapper type: `User Realm Role`
   - Token claim name: `userRoles`
   - Claim JSON type: `String`
   - Multivalued: `ON`
   - Add to access token: `ON`
   - Add to ID token: `ON`
   - Add to userinfo: `ON`

Why: if this mapper is missing, the app does not receive platform roles.

## 4) Assign platform admins

For each admin user:

1. Go to `Users`.
2. Open the user.
3. Go to `Role mapping`.
4. Click `Assign role`.
5. Assign realm role `Platform.Admin`.

Optional group-based assignment:

1. Go to `Groups`.
2. Open admin group.
3. Go to `Role mapping`.
4. Assign `Platform.Admin`.
5. Add users to that group.

## 5) Validation checklist

1. Sign in with a user who should be a platform admin.
2. Decode access token and verify `userRoles` contains `Platform.Admin`.
3. Open Users page in the portal and confirm users are listed.
4. Create a user with platform role `User`.
5. Create a user with platform role `Platform Admin`.
6. In Keycloak, verify the new admin user has realm role `Platform.Admin`.

## 6) Notes

- `Organization.*` roles are app-level roles from JWT.
- Resource ACL roles (organization/workspace/runner/dataset) are managed by backend access management.
- Creating a user in Keycloak does not automatically assign organization ACL permissions.
