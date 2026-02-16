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

3. Assignment interactions (staged workflow)
- Each assignable resource row has an `Assign` button (except `RUN` rows).
- Role menu supports fixed values: `Admin`, `Editor`, `Viewer`, `User`, `None`.
- `None` removes explicit ACL access.
- Changes are staged as local drafts and persisted only on `Validate All`.
- `Discard` clears all pending drafts for the selected user.

4. Draft UX and visual states
- Draft role badges are shown inline in the tree.
- Auto-propagated drafts are visually distinct from direct user edits.
- A bottom action bar appears when drafts exist:
  - Auto-assigned roles summary
  - `Validate All`
  - `Discard`
- Both light and dark themes are supported for all assignment states.

5. API persistence (implemented)
- `Validate All` computes deltas and calls ACL endpoints for:
  - Organization
  - Solution
  - Workspace
  - Runner
- Operations supported:
  - Add access control
  - Update access control
  - Remove access control
- Update payloads follow API v5 object format (`{ role: "..." }`).
- After successful writes, data is refreshed to keep users/resources in sync.

6. Propagation behavior (implemented)
- Workspace role draft can auto-propagate to parent Solution and Organization.
- Runner role draft can auto-propagate to Workspace, Solution, and Organization.
- Solution role draft can auto-propagate to Organization.
- Propagation is non-destructive:
  - Parent is auto-filled only when parent current/base role is `none`.
  - Existing parent roles are not overwritten by propagation.
- If multiple auto-propagations target the same empty parent, highest role wins:
  - `admin > editor > viewer > user > none`
- Direct manual draft on a parent always takes precedence over auto-propagation.

7. Permission and action gating
- Assign action is enabled when current operator has:
  - `Platform.Admin` OR
  - `write_security` on the target resource
- If operator lacks permission:
  - Assign button remains visible but disabled (grey, non-clickable).


## Target Business Flow
Most used workflow remains:
1. From a workspace, assign a user `Editor` -> user should also get `Editor` on parent Solution and Organization.
2. From a workspace, assign a user `Viewer` -> user should also get `Viewer` on parent Solution and Organization.
3. From a workspace, view all users having access and their effective rights.

## Remaining Work / Open Points
1. Propagation policy validation with business owners
- Current implementation avoids overwriting non-empty parent roles.
- Confirm whether future behavior should support forced upgrade/downgrade of non-empty parent roles.

2. Run-level (`RUN`) assignment support
- `RUN` rows are currently display-only for assignment actions.

3. Advanced UX scope
- Tree pagination/virtualization (`Show N more`) is not part of current assignment implementation.
- No bulk multi-user assignment workflow yet.

4. Error experience hardening
- Inline errors are implemented; future enhancement can add richer diagnostics/retry strategies per failed operation.
