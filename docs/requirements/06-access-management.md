<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Access Management — Product Specification

The Access Management page is the central place for managing user access rights across the entire resource hierarchy (Organizations, Solutions, Workspaces, Runners).

## Who can access this page?

- **Platform Administrator** — Full access: can view every user and assign roles on any resource.
- **Users with `write_security` permission** — Can assign roles only on resources where they hold that permission.
- **Standard User** — Read-only view of their own access rights (no assign buttons).

## Page layout

The page is divided into two main panels inside a responsive grid:
**Users panel** 
**Resource panel** 

Above both panels sits a toolbar with:
- A **user search** field (searches by name, email, username, ID)
- A **scope filter** toggle group (Organizations, Solutions, Workspaces, Runners)
- A **resource search** field (filters the tree by the selected scope)

---

## Users panel

### User list
A scrollable list of every user registered in the platform.

Each row displays:
- **Avatar** — Colored circle with the user's initials. The color is deterministic (same user always gets the same color).
- **Name** — Full name of the user.
- **Email** — Email address shown below the name.
- **Assigned roles count** — A numeric badge showing how many resources the user has a non-`none` role on (sourced from `user.resourcePermissions`).

### Selection behavior
- On first load, the first user in the list is automatically selected.
- Clicking a user row selects that user and updates the resource panel.
- Switching users clears all pending drafts (unsaved role changes are discarded).

### Search
- The user search field filters the list in real time.
- Matching is case-insensitive and checks: `id`, `name`, `email`, `username`.

---

## Resource panel

### Header
When a user is selected, the panel header shows:
- **Avatar** (larger, 42 px)
- **Name** and **email**
- **Platform role badge** — `Platform Admin` or `User` (or the first realm role in title case)
- **Assigned roles count** — e.g. "3 assigned roles"

### Resource hierarchy tree

Resources are displayed in a collapsible tree structure:

```
Organization
├── Solution
├── Workspace
│   ├── Runner
│   └── Runner
└── Workspace
    └── Runner
```

Each tree node displays:
- **Icon** — Type-specific icon (apartment, developer board, folder, play arrow)
- **Name** — Resource display name (falls back to ID)
- **Type label** — Uppercase type (ORGANIZATION, SOLUTION, WORKSPACE, RUNNER)
- **Item count** — Number of child items (for organizations and workspaces)
- **Assign/Role button** — Shows current role or "Assign" if no role

---

## Assignment workflow

### Role menu
Clicking the assign button on any resource opens a dropdown menu with five role options:

| Role | Priority | Description |
|------|----------|-------------|
| **Admin** | 4 (highest) | Full control including security management |
| **Editor** | 3 | Read/write access to resource content |
| **Viewer** | 2 | Read-only access |
| **User** | 1 | Minimal access (can see the resource exists) |
| **None** | 0 | No access (removes explicit ACL entry) |

The currently effective role is highlighted in the menu.

### Staged draft system
Role changes are **not applied immediately**. Instead:
1. User selects a role → a **draft** is created locally.
2. The resource row updates visually to show the pending change.
3. All drafts accumulate until the user clicks **Validate All** or **Discard**.

This prevents accidental role assignments and allows reviewing changes before persisting.

---

## Auto-propagation rules

When a role is assigned to a child resource, the system automatically propagates a matching role upward to parent resources that currently have no access (`none`).

### Propagation paths
| Source resource | Auto-fills |
|----------------|-----------|
| **Runner** | → Workspace, Solution, Organization |
| **Workspace** | → Solution, Organization |
| **Solution** | → Organization |

### Propagation constraints
- Only fills parents whose current/base role is `none`.
- Existing parent roles are **never** overwritten by propagation.
- A **direct manual draft** on a parent always takes precedence over auto-propagation.
- When multiple child drafts propagate to the same empty parent, the **highest role wins** (`admin > editor > viewer > user > none`).
- If priorities tie, the most recently touched draft wins.

---

## Footer action bar

Appears only when there are pending drafts. Contains:

| Element | Description |
|---------|-------------|
| **Summary text** | "X auto-assigned roles" (count of auto-propagated drafts) |
| **Validate All** button | Persists all pending drafts to the API |
| **Discard** button | Clears all pending drafts without saving |

Both buttons are disabled while a save operation is in progress.


### Post-save behavior
1. All drafts are cleared.
2. A success alert is shown.
3. Resource and user data is refreshed from the API to reflect the new state.
4. If the refresh of realm users fails, a warning is logged but the success state is preserved.

### Error handling
- If any API call fails, the error is shown in an inline alert with the HTTP status code and message.
- Drafts are preserved on error so the user can retry.

---

## Permission gating

The **Assign** button on each resource row is enabled only when:
- The current operator is a **Platform Admin**, OR
- The resource's `security.currentUserPermissions` includes `write_security`

When neither condition is met, the button is rendered in a disabled state.

---

## Remaining work

- [ ] Bulk role assignment (select multiple users → assign the same role across resources)
- [ ] Handle user groups in ACL entries 
- [ ] Hnald the v3