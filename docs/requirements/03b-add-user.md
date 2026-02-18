<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Add User — Product Specification

## Purpose

The Add User dialog allows a Platform Administrator to create a new user account on the platform. The new user receives a temporary password that they must change on their first login.

## Who can use this feature?

Only **Platform Administrators** can create new users. The "Create User" button is hidden from standard users.

## How it works

### Opening the dialog

The administrator clicks the **"Create User"** button at the top of the Users page. A centered dialog (modal) opens over the page.

### Form fields

The dialog contains the following fields, from top to bottom:

 **Full Name** 
 **Email** 
 **Platform Role** | Dropdown selector | Yes | Two options: **Organization User** (default) or **Platform Admin**. |
 **Temporary Password** | Text input with controls | Yes | Pre-filled with a randomly generated 12-character password. |

### Temporary password behavior

- A secure password is **automatically generated** when the dialog opens. It includes uppercase letters, lowercase letters, digits, and special characters.
- The administrator can **see or hide** the password using the eye icon.
- The administrator can **regenerate** a new random password using the refresh icon.
- The administrator can also **type a custom password** by editing the field directly.
- The password is marked as **temporary** — the new user will be forced to change it on their first login.

### Submitting the form

1. The administrator fills in all fields and clicks **"Create User"**.
2. The system validates that:
   - Full Name is not empty
   - Email is a valid format
   - Password is not empty
3. If validation fails, the invalid fields are highlighted in red.
4. If validation passes, the system creates the account.
5. During creation, the button shows a spinner with "Creating…" and all fields are disabled.
6. On success, the dialog closes and the new user appears immediately in the Users table.
7. On failure, an error message appears at the top of the dialog. The administrator can fix the issue and retry.

### Error scenarios

- Email already taken : "A user with this email or username already exists.
- Insufficient permissions : Guidance about Keycloak permission configuration

## Remaining work

- [ ] **Email invitation instead or OKTA instead temporary password:** In a future version, replace the temporary password flow with an email-based invitation or okta Sign in.

- [ ] **Add the user to a group instead of a role :** still to be validated 
