# Plan: Users View — V3 Azure Graph API Integration

**TL;DR**: Replace the mock-data Users View with a real implementation that fetches users from Microsoft Graph API (`graph.microsoft.com/v1.0`). The data comes from `servicePrincipals/{id}/appRoleAssignments` to list users assigned to the Cosmo Tech application, enriched with user profile details. A dedicated RTK Query slice (`graphApi`) handles Graph-specific data fetching with a separate token acquisition flow. This is Azure-only for V3; Keycloak (V5) will be adapted later.

**Steps**

## 1. Add requirements spec
Create `docs/requirements/07-users-view.md` documenting: list users assigned to the platform (via `appRoleAssignments`), display name/email/roles/last-login, Azure-only for V3, `Platform.Admin` role required, groups listing.

## 2. Update `apis.json` config
Add `SERVICE_PRINCIPAL_OBJECT_ID` to each Azure entry in `src/config/apis.json`. Example for "phoenixdev":
```json
"SERVICE_PRINCIPAL_OBJECT_ID": "<object-id-of-the-sp>"
```
The Keycloak entry ("KoB brewery dev") remains unchanged.

## 3. Update API config validation
In `src/services/api/apiUtils.js`, update `detectApiAuthProviderType` — no functional change needed, but document that `SERVICE_PRINCIPAL_OBJECT_ID` is expected for Azure configs. Optionally add a validation warning if an Azure config is missing this field.

## 4. Create Graph token provider
Create **`src/services/api/graphTokenProvider.js`** — a new module that:
- Imports MSAL's `PublicClientApplication` from `@azure/msal-browser` (already a transitive dependency via `@cosmotech/azure`)
- Provides `getGraphAccessToken()` that calls `acquireTokenSilent` on the existing MSAL account (retrieved from `localStorage`) with Graph scopes: `['https://graph.microsoft.com/Application.Read.All', 'https://graph.microsoft.com/User.Read.All']`
- Falls back to `acquireTokenPopup` if silent acquisition fails (incremental consent scenario)
- Reads the MSAL config (`clientId`, `authority`) from `apiManager.getApi()` to construct the MSAL instance with the same parameters as `src/services/auth/azure.js`

This keeps Graph token acquisition separate from the Cosmo API token flow in `src/services/api/apiClient.js`.

## 5. Create Graph API client
Create **`src/services/api/graphApiClient.js`** — an Axios instance with:
- Base URL: `https://graph.microsoft.com/v1.0`
- Request interceptor that calls `getGraphAccessToken()` and sets `Authorization: Bearer <token>`
- Exported methods:
  - `getAppRoleAssignments(servicePrincipalObjectId)` → `GET /servicePrincipals/{id}/appRoleAssignments`
  - `getAppRoles(servicePrincipalObjectId)` → `GET /servicePrincipals/{id}/appRoles` (to resolve role IDs to names)
  - `getUserProfiles(userIds)` → batch `GET /users/{id}?$select=displayName,mail,userPrincipalName,signInActivity` (with graceful fallback if `signInActivity` is unavailable without Azure AD Premium)
  - `getGroups(servicePrincipalObjectId)` → filter `appRoleAssignments` where `principalType === 'Group'`
  - `getGroupMembers(groupId)` → `GET /groups/{groupId}/members`

## 6. Create dedicated RTK Query slice for Graph API
Create **`src/state/graphApi/graphApiSlice.js`** with `createApi` + `fakeBaseQuery`:
- **`getAppRoleAssignments`** (query) — calls `graphApiClient.getAppRoleAssignments()` with the `SERVICE_PRINCIPAL_OBJECT_ID` from the selected API config (accessed via `apiManager`)
- **`getAppRoles`** (query) — fetches role definitions to resolve `appRoleId` → human-readable role name (e.g. `Platform.Admin`, `Platform.User`)
- **`getPlatformUsers`** (query) — orchestrating endpoint that:
  1. Fetches `appRoleAssignments` + `appRoles`
  2. Filters assignments where `principalType === 'User'`
  3. Batch-fetches user profiles (email, signInActivity) for each unique `principalId`
  4. Returns a normalized array matching the table's data shape: `{ id, name, email, platformRoles[], assignedDate, lastLogin, principalType }`
- **`getPlatformGroups`** (query) — filters assignments where `principalType === 'Group'`, returns group list
- **`getGroupMembers`** (query) — fetches members of a specific group

Export hooks: `useGetPlatformUsersQuery`, `useGetPlatformGroupsQuery`, `useGetGroupMembersQuery`.

## 7. Register the Graph API slice
- `src/state/rootReducer.js`: Add `[graphApi.reducerPath]: graphApi.reducer`
- `src/state/store.config.js`: Add `.concat(graphApi.middleware)` to the middleware chain

## 8. Expose selected API config from `apiManager`
In `src/services/api/apiManager.js`, ensure `getApi()` returns the full config object (it already does). The `graphApiSlice` will import `apiManager` and read `SERVICE_PRINCIPAL_OBJECT_ID` and `AZURE_TENANT_ID` from the selected API. Also add a `getAuthProviderType()` convenience check (already exists).

## 9. Refactor `UsersTable` to accept props
Modify `src/components/UsersTable/UsersTable.jsx`:
- Remove `import mockUsers` — accept `users` array and `isLoading`/`error` as props
- Keep pagination, filtering, selection, bulk actions logic internal
- Adjust filter keys: replace `organizations` filter with `type` (User/Group) since Graph API doesn't natively return org membership
- Adjust table columns: **Name** | **Email** | **Platform Roles** | **Type** | **Assigned Date** | **Last Login** | **Actions**

Update `src/components/UsersTable/UsersTableFilters.jsx` to match the new columns. Update `src/components/UsersTable/UserStatusChip.jsx` — replace active/suspended with principalType chip (User/Group) or keep it if status is derivable.

## 10. Wire up Users view
Rewrite `src/views/Users.jsx`:
- Use `useGetPlatformUsersQuery()` from the Graph API slice
- Check `apiManager.getAuthProviderType() === 'azure'` — if Keycloak, show an "Unsupported for this API" message (V5 adaptation comes later)
- Check the user's roles from `useAuth()` for `Platform.Admin` — if not admin, show access-denied message
- Pass `data`, `isLoading`, `error` to `UsersTable`
- Handle error states (token acquisition failure, Graph API errors, missing permissions)

## 11. Add i18n translations
Update `src/i18n/locales/en/common.json` and `src/i18n/locales/fr/common.json`:
- `users.title`, `users.subtitle`, `users.accessDenied`, `users.unsupportedProvider`
- `users.columns.name`, `users.columns.email`, `users.columns.platformRoles`, `users.columns.type`, `users.columns.assignedDate`, `users.columns.lastLogin`, `users.columns.actions`
- `users.errors.fetchFailed`, `users.errors.permissionDenied`
- `users.noResults`

## 12. Keep mock data for development fallback
Keep `src/components/UsersTable/mockUsers.js` for offline/development use. Add an optional `useMockData` prop or environment check in the `Users` view to toggle between real and mock data during development.

## 13. Azure AD App Registration prerequisites (documentation)
Document in the requirements file that the Azure AD App Registration must have the following **delegated permissions** with admin consent:
- `Application.Read.All` — read `appRoleAssignments` on service principals
- `User.Read.All` — read user profiles (email, displayName)
- `AuditLog.Read.All` (optional) — read `signInActivity` (requires Azure AD Premium P1/P2)

---

## Verification

1. **Unit tests**: Test `graphApiClient.js` methods with mocked Axios responses; test `graphApiSlice` endpoints with MSW or mocked queryFn
2. **Integration test**: Verify `UsersTable` renders data from RTK Query (mock the query hook)
3. **Manual testing**: Log in to an Azure API ("phoenixdev" or "warp wa-adx-dev"), navigate to `/users`, verify users list loads from Graph, check filtering/pagination works, verify Keycloak API shows "unsupported" message, verify non-admin sees access-denied
4. **Error scenarios**: Test with invalid/expired Graph token, missing `SERVICE_PRINCIPAL_OBJECT_ID`, insufficient Graph permissions

## Decisions

- **Microsoft Graph (modern)** over legacy Azure AD Graph — future-proof, actively maintained
- **`SERVICE_PRINCIPAL_OBJECT_ID` in apis.json** — explicit config, avoids runtime Graph query overhead and extra permissions
- **Separate Graph token acquisition** — clean separation from Cosmo API tokens, explicit scopes
- **Dedicated RTK Query slice** (`graphApi`) — separates Graph API concerns from `cosmoApi`, cleaner cache management
- **"Organizations" column removed** from table — Graph `appRoleAssignments` doesn't contain Cosmo Tech org info; replaced with **Type** (User/Group) and **Assigned Date**

## File Inventory

**New files**: `graphTokenProvider.js`, `graphApiClient.js`, `graphApiSlice.js`, `07-users-view.md`
**Modified files**: `apis.json`, `rootReducer.js`, `store.config.js`, `Users.jsx`, `UsersTable.jsx`, `UsersTableFilters.jsx`, `UserStatusChip.jsx`, i18n JSONs, optionally `apiUtils.js`
