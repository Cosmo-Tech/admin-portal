<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Users Page — Product Specification

## Purpose

The Users page is the central place for Platform Administrators to view, search, and manage every user registered in the platform. It provides a clear overview of who has access, what role they hold, and whether their account is active.

---

## Who can access this page?

| Viewer | What they see |
|--------|---------------|
| **Platform Administrator** | Full table with action buttons (add, delete, manage) and bulk selection |
| **Standard User** | Full table in read-only mode — no action buttons, no checkboxes, no add user button |

---

## Page layout

### Header section

- **Title:** "Users"
- **Subtitle:** Brief description of the page purpose
- **"Create User" button:** Visible only to Platform Administrators. Opens the Add User dialog (see separate specification: *03b — Add User*).

### Users table

A data table listing every user on the platform. Each row displays:

| Column | Description |
|--------|-------------|
| **Checkbox** | For bulk selection (Platform Administrators only) |
| **Name** | Full name with a colored avatar showing the user's initials. The avatar color is deterministic — the same user always gets the same color. |
| **Email** | The user's email address |
| **Platform Role** | Either **Admin** or **User** |
| **Status** | Either **Active** or **Suspended**, shown as a chip/badge |
| **Actions** | "Manage" and "Delete" buttons (Platform Administrators only) |

> **Note:** The following columns were intentionally removed from the table:
> - *Organizations* — not relevant at the platform level
> - *Last Login* — data is fetched but not displayed in the table

### Avatars

- Each user row starts with a small circular avatar containing the user's initials (first letter of first name + first letter of last name).
- Avatar background colors are drawn from the platform's theme palette and are consistent with the colors used on the Access Management page.
- The text color inside the avatar also follows the theme.

### Filtering

A filter row sits directly below the table header. Users can type to filter by:

- **Name** — partial text match
- **Email** — partial text match
- **Role** — partial text match (e.g., typing "Admin")
- **Status** — partial text match (e.g., typing "Active")

Filters are applied as you type, and the table resets to page 1 on every filter change.

### Pagination

- 10 rows per page
- Page navigation at the bottom of the table
- Shows total number of users

### Bulk actions toolbar

When one or more users are selected via checkboxes, a toolbar appears above the table showing how many users are selected. *(Bulk actions such as "Delete selected" are planned but not yet functional — see Remaining Work below.)*

---

## Actions (Platform Administrators only)

### Delete user

1. Administrator clicks the **Delete** button on a user row.
2. A confirmation dialog appears with the message: *"Are you sure you want to delete **{user name}**? This action cannot be undone."*
3. The administrator can **Cancel** or **Confirm**.
4. On confirmation, the user is permanently removed from the platform.
5. If the deletion fails (e.g., permission issue, user already deleted), an error message is shown inside the dialog.
6. During deletion, the confirm button shows a loading spinner and both buttons are disabled.

### Manage user

The "Manage" button appears on each row but does not yet open a user detail view. *(See Remaining Work.)*

---

## Themes

The Users page supports both **light** and **dark** themes. All colors, backgrounds, text, and avatar colors adapt automatically when the user switches theme.

---

## Empty state

When no users match the current filters, the table body displays a centered "No users found" message.

---

## What is done

- [x] Users table with Name, Email, Platform Role, Status, and Actions columns
- [x] Colored avatar initials consistent with Access Management page
- [x] Filter row for all visible columns
- [x] Pagination (10 rows per page)
- [x] Checkbox selection for bulk actions
- [x] Bulk actions toolbar (selection counter visible)
- [x] Delete user with confirmation dialog
- [x] Error handling in delete dialog (403, 404, generic errors)
- [x] Light and dark theme support
- [x] "Create User" button (opens separate dialog — see *03b — Add User*)
- [x] Read-only view for non-administrator users (buttons and checkboxes hidden)
- [x] Translations in English and French
- [x] Role assignment: Platform.Admin role correctly applied when creating admin users
- [x] Role assignment: Organization.User role correctly applied when creating regular users

## Remaining work

- [ ] **Manage user:** Clicking "Manage" should open a detail view or side panel where an administrator can edit the user's name, email, role, or suspend/re-enable their account.
- [ ] **Bulk delete:** The bulk actions toolbar should include a "Delete" button to remove multiple selected users at once, with a confirmation dialog listing all affected users.
- [ ] **Bulk role change:** Allow an administrator to change the platform role for multiple selected users in one action.
- [ ] **Search by name across table:** Consider adding a global search bar above the table in addition to per-column filters.
- [ ] **Sort columns:** Allow sorting the table by clicking column headers (alphabetical for Name/Email, role priority, status).
- [ ] **Export users list:** Provide a way to download the full user list as CSV or Excel for auditing.
