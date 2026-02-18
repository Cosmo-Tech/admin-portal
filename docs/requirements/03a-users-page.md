<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Users Page — Product Specification

The Users page is the central place for Platform Administrators to view, search, and manage every user registered in the platform


## Who can access this page?

- **Platform Administrator**  Full table with action buttons (add, delete, manage)
- **Standard User** Full table in read-only mode — no action buttons, no checkboxes, no add user button #still to be verified till it's only for the admins 

### Users table

A data table listing every user on the platform. Each row displays: 

- **Checkbox**  For bulk selection (Platform Administrators only)
- **Name** Full name with a colored avatar showing the user's initials. The avatar color is deterministic — the same user always gets the same color.
- **Email**  The user's email address 
- **Platform Role**  Either **Admin** or **User** 
- **Status**  Either **Active** or **Suspended**, shown as a chip/badge 
- **Actions**  "Manage" and "Delete" buttons (Platform Administrators only)

### Delete user

1. Administrator clicks the **Delete** button on a user row.
2. A confirmation dialog appears with the message: *"Are you sure you want to delete **{user name}**? This action cannot be undone."*
3. The administrator can **Cancel** or **Confirm**.
4. On confirmation, the user is permanently removed from the platform.
5. If the deletion fails (e.g., permission issue, user already deleted), an error message is shown inside the dialog.
6. During deletion, the confirm button shows a loading spinner and both buttons are disabled.

### Add user 

Visible only to Platform Administrators. Opens the Add User dialog (see separate specification: *03b — Add User*).


## Remaining work 

- [ ] Validate if the organization users can see the list of users 
- [ ] **Manage user:** Clicking "Manage" should open a detail view or side panel where an administrator can edit the user's name, email, role, or suspend/re-enable their account.

- [ ] **Bulk delete and role change** still to be validated 

- [ ] **Handle the groups**

- [ ] **Handle the V3**
 