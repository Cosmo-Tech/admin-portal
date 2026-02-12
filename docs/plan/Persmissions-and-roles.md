<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

## Plan: Permissions and Roles System Implementation

Implement a robust permissions and roles system in the admin portal, inspired by the azure-sample-webapp project. This system will include JWT roles, organization-level mappings, resource-level permissions, and a `PermissionsGate` component. The implementation will integrate the v5 API for permissions while maintaining compatibility with v3.

**Steps**
1. **Create `SecurityUtils` Utility**
   - Add a new file in `src/services/auth/` for `SecurityUtils`.
   - Implement functions for role-to-permission mapping, resource-level security checks, and JWT role parsing.
   - Reference the azure-sample-webapp's `SecurityUtils` for structure.

2. **Enhance API Client**
   - Update `apiClient.js` to support v5 API endpoints for permissions.
   - Add `listPermissions` and other relevant methods for fetching permissions.

3. **Update Redux State**
   - Create a new slice in `state/` for managing roles and permissions.
   - Add actions and reducers for fetching, storing, and updating permissions.
   - Use RTK Query for caching and optimistic updates.

4. **Implement `PermissionsGate` Component**
   - Add a new component in `src/components/PermissionsGate/`.
   - Implement declarative UI gating based on user permissions.
   - Use `SecurityUtils` for permission checks.

5. **Integrate Permissions Mapping**
   - Update `fetchInitialData.js` to include permissions mapping during app initialization.
   - Fetch permissions for the current user and store them in Redux.

6. **Patch Resources with Permissions**
   - Add utilities in `src/services/api/` for patching resources with `currentUserPermissions`.
   - Ensure compatibility with organizations, workspaces, runners, and datasets.

7. **Update Views**
   - Integrate `PermissionsGate` into views like `Organizations`, `Workspaces`, and `Users`.
   - Replace hardcoded permission checks with `PermissionsGate`.

8. **Testing and Validation**
   - Write unit tests for `SecurityUtils`, `PermissionsGate`, and Redux slice.
   - Test API client enhancements with mock data.
   - Validate the system with real-world scenarios.

**Verification**
- Run unit tests and ensure 100% coverage for new components and utilities.
- Test the system manually with different user roles and permissions.
- Validate API interactions with v5 and v3 endpoints.

**Decisions**
- Chose RTK Query over Redux Thunks for state management.
- Prioritized v5 API integration with v3 fallback.
- Adopted azure-sample-webapp's structure for `SecurityUtils` and `PermissionsGate`.





this is the Result of the workflow impelmented 
Permissions System Workflow Explained
Here's a simple explanation of how the permissions system now works in your app:

1. User Logs In
User authenticates (Azure/Keycloak)
Their JWT roles (like "Platform.Admin", "Organization.User") are saved in Redux
2. App Loads Initial Data
When the user becomes authenticated, the app automatically:

Fetches the Permissions Mapping from the API

Gets a list like: { organization: { admin: ['read', 'write', 'delete'], viewer: ['read'] }, workspace: {...} }
Stores this in Redux so the app knows "what does each role allow?"
Fetches Organizations & Workspaces

Gets all the user's organizations and workspaces
Patches Each Resource

For each organization/workspace, the app figures out "what permissions does THIS user have on THIS resource?"
Adds currentUserPermissions: ['read', 'write'] to the resource's security object
This is stored in Redux for quick access
User Logs In
    ↓
Fetch Permissions Mapping (roles → permissions)
    ↓
Fetch Organizations & Workspaces
    ↓
For each resource:
  - Calculate user's permissions on it
  - Add currentUserPermissions to the object
    ↓
Redux stores everything
    ↓
Components use PermissionsGate or hooks to check permissions
    ↓
Show/hide features accordingly