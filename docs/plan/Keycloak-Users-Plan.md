<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Plan: Keycloak Real Users & Per-User Permissions

Replace the mocked UsersTable with real Keycloak realm users, compute per-user resource permissions client-side from already-fetched ACLs, and gate the "Manage" button behind `Platform.Admin`. This is a **read-only listing phase** — actual edit/delete/group actions remain stubs.

**Steps**

### 1. Derive Keycloak Admin API base URL

In [src/services/api/apiClient.js](src/services/api/apiClient.js), add a utility function `deriveKeycloakAdminUrl(realmUrl)` that transforms the realm URL (e.g. `https://host/keycloak/realms/brewery`) into the admin base (e.g. `https://host/keycloak/admin/realms/brewery`). The `AUTH_KEYCLOAK_REALM` config value already stored per API environment provides the input. Expose this alongside the existing `deriveV5ApiUrl()`.

Additionally, extend the API client object returned by `getApiClient()` with a reference to the raw `axiosClientApi` instance (or a dedicated `keycloakAdminAxios`) so RTK Query endpoints can make arbitrary Keycloak Admin REST calls using the same token interceptor.

### 2. Add RTK Query endpoints for Keycloak Admin API

In [src/state/api/apiSlice.js](src/state/api/apiSlice.js), add two new query endpoints following the existing `fakeBaseQuery` + `queryFn` pattern:

- **`getRealmUsers`** — `GET /admin/realms/{realm}/users` with `?max=500` (or paginated). Returns the array of Keycloak user objects. Uses the Axios instance from `thunkAPI.extra.api` with the derived admin base URL.
- **`getUserLoginEvents`** — `GET /admin/realms/{realm}/events?type=LOGIN&user={userId}` per user. Consider batching: either one call per user or a single call with `?type=LOGIN` then filtering client-side by `userId`. Return a `Map<userId, lastLoginTimestamp>`.

Export generated hooks: `useGetRealmUsersQuery`, `useGetUserLoginEventsQuery`.

### 3. Create Redux `users` slice

Create [src/state/users/](src/state/users/) with:

- [reducers.js](src/state/users/reducers.js) — State shape:
  ```
  {
    list: [],           // Keycloak user objects enriched with permissions
    status: 'IDLE',     // IDLE | LOADING | SUCCESS | ERROR
    error: null
  }
  ```
  Actions: `setUsers`, `setUsersStatus`, `setUserPermissions`.
  
- [hooks.js](src/state/users/hooks.js) — `useUsersList()`, `useUsersListStatus()`, `useFetchRealmUsers()` (dispatches the RTK Query or thunk).

- [constants.js](src/state/users/constants.js) — `USERS_STATUS` enum.

Register the new slice in [src/state/rootReducer.js](src/state/rootReducer.js).

### 4. Compute per-user resource permissions client-side

After `fetchInitialData` completes (organizations, workspaces, runners already in Redux with their `security.accessControlList`), create a thunk `computeAllUsersPermissions` in [src/state/users/thunks/computeAllUsersPermissions.js](src/state/users/thunks/computeAllUsersPermissions.js):

- Read from Redux: `organizations.list`, `workspaces.list`, `runners.list`, `app.permissionsMapping`.
- Read from newly fetched Keycloak users: `users.list` (user emails).
- For each user, iterate every organization/workspace/runner and call `SecurityUtils.getUserPermissionsForResource(resource.security, userEmail, permissionsMapping[component])`.
- Build a per-user permissions object:
  ```
  {
    userId: "...",
    email: "...",
    resourcePermissions: {
      organizations: { "org-id-1": { role: "admin", permissions: [...] }, ... },
      workspaces: { "ws-id-1": { role: "viewer", permissions: [...] }, ... },
      runners: { "runner-id-1": { role: "editor", permissions: [...] }, ... }
    }
  }
  ```
- Dispatch `setUserPermissions` to store enriched user data in Redux.

### 5. Orchestrate data loading

In [src/components/DataLoader/DataLoader.jsx](src/components/DataLoader/DataLoader.jsx) (or [src/state/app/thunks/fetchInitialData.js](src/state/app/thunks/fetchInitialData.js)):

- After `fetchInitialData` succeeds, trigger Keycloak user fetching (`getRealmUsers` query).
- After users are fetched, trigger `computeAllUsersPermissions`.
- The loading sequence becomes: **Auth → fetchInitialData (orgs/ws/runners + permissions mapping) → fetch Keycloak users + login events → compute per-user permissions → Redux ready**.

Guard the Keycloak admin calls behind a check: only fetch if the current user has `Platform.Admin` in their JWT roles (`state.auth.roles`). Non-admin users skip straight to the Users view with read-only data (they may see only their own info or an empty list, depending on Keycloak config).

### 6. Refactor UsersTable to consume Redux

In [src/components/UsersTable/UsersTable.jsx](src/components/UsersTable/UsersTable.jsx):

- Remove the `import mockUsers` and all mock data references.
- Connect to Redux via the new hooks: `useUsersList()`, `useUsersListStatus()`.
- Map Keycloak user objects to the table row shape:

  | Column | Source |
  |--------|--------|
  | Name | `firstName + lastName` |
  | Email | `email` |
  | Platform Roles | Check if `Platform.Admin` is in user's realm roles (from Keycloak user role-mappings or from the JWT claim config) — display "Admin" or "User" |
  | Organizations | List org names from `resourcePermissions.organizations` keys |
  | Last Login | From login events data (`time` field, formatted) |
  | Status | `enabled` field from Keycloak → Active/Suspended chip |
  | Actions | "Manage" button, gated by permissions |

- Show a loading skeleton/spinner while `usersStatus === 'LOADING'`.
- Delete [src/components/UsersTable/mockUsers.js](src/components/UsersTable/mockUsers.js).

### 7. Gate "Manage" button behind Platform.Admin

In [src/components/UsersTable/UserActions.jsx](src/components/UsersTable/UserActions.jsx):

- Import `useUserRoles()` from [src/state/auth/hooks.js](src/state/auth/hooks.js) and `APP_ROLES` from [src/services/config/accessControl/Roles.js](src/services/config/accessControl/Roles.js).
- Conditionally render the "Manage" button and delete icon only when `roles.includes(APP_ROLES.PlatformAdmin)` (or the exact role string `'Platform.Admin'`).
- Alternatively, wrap the button with the existing `PermissionsGate` component from [src/components/PermissionsGate/PermissionsGate.jsx](src/components/PermissionsGate/PermissionsGate.jsx), passing `userPermissions={currentUserRoles}` and `requiredPermissions={['Platform.Admin']}`.

Similarly, gate `BulkActionsToolbar` actions in [src/components/UsersTable/BulkActionsToolbar.jsx](src/components/UsersTable/BulkActionsToolbar.jsx).

### 8. Populate `auth.permissions` on login

In [src/state/auth/thunks/login.js](src/state/auth/thunks/login.js) (or in `fetchInitialData`), after roles are available from JWT:

- Map JWT roles (e.g. `Platform.Admin`) to app-level permissions using the permissions mapping from the API.
- Dispatch `setAuthData({ ..., permissions: resolvedPermissions })` so `state.auth.permissions` is no longer always `[]`.
- This enables `PermissionsGate` to work generically across all views.

### 9. Fetch user realm roles (Platform.Admin detection)

The Keycloak `/users` endpoint doesn't include realm roles. To determine if each user is an admin:

- **Option A (recommended):** Add an RTK Query endpoint `getUserRealmRoles` — `GET /admin/realms/{realm}/users/{userId}/role-mappings/realm` for each user. Batch these calls (or parallelize with `Promise.all`). This returns the realm roles array. Check for `Platform.Admin` (or `platform.Admin` per Keycloak convention).
- **Option B:** If a Keycloak group corresponds to the admin role, use the groups endpoint to list admin group members.

Store the admin flag per user in the enriched user object in Redux.

### 10. Add i18n keys

In [src/i18n/locales/en/common.json](src/i18n/locales/en/common.json) and [src/i18n/locales/fr/common.json](src/i18n/locales/fr/common.json), add:

- `users.loading` — "Loading users..."
- `users.error` — "Failed to load users"
- `users.empty` — "No users found"
- `users.role.admin` — "Admin"
- `users.role.user` — "User"
- `users.lastLogin.unavailable` — "N/A"
- `users.permissions.title` — "Permissions"

### 11. Update Users view

In [src/views/Users.jsx](src/views/Users.jsx):

- Add loading/error states based on `useUsersListStatus()`.
- Show an `ErrorBoundary`-wrapped `UsersTable` when data is ready.
- For non-admin users who cannot fetch the realm user list, show a graceful fallback (e.g. a message or a limited self-only view).

---

**Verification**

1. **Unit tests:** Test `computeAllUsersPermissions` with mock ACLs and verify the output permissions object per user matches expected role→permissions resolution via `SecurityUtils`.
2. **Integration test:** Mock the Keycloak Admin API responses (users, events, role-mappings) and verify the UsersTable renders correct columns with real data shapes.
3. **Manual:** Log in as `Platform.Admin` user → verify all realm users appear, "Manage" button visible. Log in as non-admin → verify "Manage" button hidden, user list either empty or read-only.
4. **Redux DevTools:** Inspect `state.users.list` to confirm enriched user objects with `resourcePermissions` are populated.

**Decisions**

- **RTK Query over thunks** for Keycloak Admin API calls — consistent with project guidelines and enables caching/refetch.
- **Reuse existing token** — no separate service account; `Platform.Admin` users must have `realm-management: view-users` and `view-events` Keycloak roles.
- **Client-side ACL iteration** for per-user permissions — avoids N API calls per user; leverages already-fetched `security.accessControlList` from each resource.
- **Read-only phase** — "Manage", "Delete", "Add" buttons remain stubs; only visibility gating is implemented.
- **Login events** may be unavailable (Keycloak event retention) — show "N/A" gracefully.