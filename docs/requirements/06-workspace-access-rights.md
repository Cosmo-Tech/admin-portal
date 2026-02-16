<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech --> 

# Workspace Access Rights

## Goal
Allow platform administrators to view and manage user access rights across the resource hierarchy:
- Organization
- Solution
- Workspace
- Runner

## Current Product Scope (Implemented)
The Access Management page now provides:

1. User-centric access view
- A searchable users panel.
- Selection of a user to inspect current access.
- Display of:
  - Assigned roles count
  - Platform role (`Platform Admin` or `User`)

2. Resource hierarchy view
- A searchable hierarchy by scope:
  - Organizations
  - Solutions
  - Workspaces
  - Runners
- Hierarchical display:
  - Organization -> Solutions + Workspaces -> Runners

3. Access visibility per resource
- For the selected user, each resource line can show the current role badge (e.g. `Viewer`, `Editor`, `Admin`) when assigned.
- If no role is assigned (`none`), no role badge is shown.


## Target Business Flow
Most used workflow remains:
1. From a workspace, assign a user `Editor` -> user should also get `Editor` on parent Solution and Organization.
2. From a workspace, assign a user `Viewer` -> user should also get `Viewer` on parent Solution and Organization.
3. From a workspace, view all users having access and their effective rights.

## Remaining Work (Not Yet Implemented)
The remaining scope is functional integration, not UI:

1. Real assignment actions
- Wire the `Assign` action to open role assignment/edit interactions.
- Support add, update, and remove access.

2. API integration for security updates
- Connect assignment actions to platform security endpoints (Organization/Solution/Workspace/Runner).
- Persist role/default/ACL changes to backend.

3. Propagation rules execution
- Implement parent propagation when assigning at workspace level (Workspace -> Solution -> Organization) according to business rules.
- Ensure consistent downgrade/upgrade behavior when role changes.

4. Refresh and consistency
- Refresh resource/user permissions after write operations.
- Keep list and hierarchy synchronized with backend state.

5. Error and permission handling
- Handle unauthorized actions and API failures with clear feedback.
- Enforce role constraints (e.g., non-admin users cannot manage roles).

6. For teh users who don't have access to manage a resource, the manage button won't be avaialable for them 
