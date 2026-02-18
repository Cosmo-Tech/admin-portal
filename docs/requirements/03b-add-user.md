<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Add User — Product Specification

## Purpose

The Add User dialog allows a Platform Administrator to create a new user account on the platform. The new user receives a temporary password that they must change on their first login.

---

## Who can use this feature?

Only **Platform Administrators** can create new users. The "Create User" button is hidden from standard users.

---

## How it works

### Opening the dialog

The administrator clicks the **"Create User"** button at the top of the Users page. A centered dialog (modal) opens over the page.

### Form fields

The dialog contains the following fields, from top to bottom:

| Field | Type | Required | Details |
|-------|------|----------|---------|
| **Full Name** | Text input | Yes | The user's first and last name. Automatically split into first name + last name internally. |
| **Email** | Text input | Yes | Must be a valid email format. Also used as the user's login username. |
| **Platform Role** | Dropdown selector | Yes | Two options: **Organization User** (default) or **Platform Admin**. |
| **Temporary Password** | Text input with controls | Yes | Pre-filled with a randomly generated 12-character password. |

### Temporary password behavior

- A secure password is **automatically generated** when the dialog opens. It includes uppercase letters, lowercase letters, digits, and special characters.
- The administrator can **see or hide** the password using the eye icon.
- The administrator can **regenerate** a new random password using the refresh icon.
- The administrator can also **type a custom password** by editing the field directly.
- The password is marked as **temporary** — the new user will be forced to change it on their first login.

### Platform role selection

- **Organization User** (default): The person gets standard access with no administrative privileges. They are assigned the Organization.User role in the identity provider.
- **Platform Admin**: The person becomes a Platform Administrator with full management rights including the ability to create, delete, and manage other users. They are assigned the Platform.Admin role in the identity provider.

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

| Scenario | Message shown |
|----------|---------------|
| Email already taken | "A user with this email or username already exists." |
| Insufficient permissions | Guidance about Keycloak permission configuration |
| Other server error | Generic error message from the server |

### Closing the dialog

- Click **"Cancel"** or the **X** button in the top-right corner.
- The form resets completely every time the dialog is reopened (no leftover data from previous attempts).
- The dialog cannot be closed while a creation is in progress.

---

## Themes

The dialog adapts to the current theme (light or dark). All backgrounds, text colors, and input styling follow the platform's design system.

---

## Translations

All labels, placeholders, button text, and error messages are available in **English** and **French**.

---

## What is done

- [x] Dialog with Full Name, Email, Platform Role, and Temporary Password fields
- [x] Automatic password generation (12 characters, mixed character types)
- [x] Show/hide password toggle
- [x] Regenerate password button
- [x] Editable password field (administrator can type a custom password)
- [x] Platform Role selector (User / Admin dropdown)
- [x] Client-side validation (required fields, email format)
- [x] Error display for duplicate email (409) and permission denied (403)
- [x] Loading state during submission (spinner, disabled fields)
- [x] Form reset on dialog open
- [x] Dialog close prevention during submission
- [x] User list auto-refresh after successful creation
- [x] English and French translations
- [x] Light and dark theme support
- [x] Platform.Admin role correctly assigned when Admin is selected
- [x] Organization.User role correctly assigned when User is selected (instead of default realm roles)

## Remaining work

- [ ] **Email invitation instead of temporary password:** In a future version, replace the temporary password flow with an email-based invitation. The system would send a welcome email containing a link for the new user to set their own password. The temporary password field would be removed from the dialog.
- [ ] **Password strength indicator:** Show a visual indicator (weak / medium / strong) as the administrator types or generates a password.
- [ ] **Confirmation step:** Consider adding a summary screen before final submission, showing all entered details for the administrator to review before confirming.
- [ ] **Success feedback:** Show a brief success notification (toast / snackbar) after the user is created, rather than silently closing the dialog.
- [ ] **Organization assignment:** Allow the administrator to assign the new user to one or more organizations directly from the creation dialog, so they appear correctly in Access Management from the start.
