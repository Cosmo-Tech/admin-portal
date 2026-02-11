<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Users View — V3 Azure AD Graph

## Overview

The Users View displays all users and groups assigned to the Cosmo Tech platform's service principal. It fetches data from **Microsoft Graph API** (`graph.microsoft.com/v1.0`) using delegated permissions. Access is restricted to users with the `Platform.Admin` role.

## Scope

- **Azure only** — Keycloak-based APIs show an "unsupported provider" message.
- **V3 platform** — Uses modern Microsoft Graph API (v1.0).

## Required Queries

### 1. List users assigned to the service principal

```
GET https://graph.microsoft.com/v1.0/servicePrincipals/{spObjectId}/appRoleAssignedTo
```

Filters results where `principalType === 'User'`.

### 2. List groups assigned to the service principal

Same endpoint as above, filters results where `principalType === 'Group'`.

### 3. List members of a group

```
GET https://graph.microsoft.com/v1.0/groups/{groupId}/members
```

### 4. Resolve app role definitions

```
GET https://graph.microsoft.com/v1.0/servicePrincipals/{spObjectId}?$select=appRoles
```

Reads `appRoles` array to map `appRoleId` → human-readable role name (e.g., `Platform.Admin`, `Platform.User`).

## Data Shape (appRoleAssignment)

| Field                | Type   | Description                                      |
|----------------------|--------|--------------------------------------------------|
| `id`                 | string | Assignment ID                                    |
| `principalId`        | string | Object ID of the assigned user or group          |
| `principalDisplayName` | string | Display name of the user or group              |
| `principalType`      | string | `User` or `Group`                                |
| `appRoleId`          | string | GUID of the assigned app role                    |
| `creationTimestamp`  | string | ISO 8601 date when the assignment was created    |
| `resourceId`         | string | Object ID of the service principal               |
| `resourceDisplayName`| string | Display name of the service principal            |

## Table Columns

| Column         | Source field              | Notes                                |
|----------------|---------------------------|--------------------------------------|
| Name           | `principalDisplayName`    |                                      |
| Platform Roles | Resolved from `appRoleId` | Mapped via service principal appRoles|
| Type           | `principalType`           | Chip: User (blue) / Group (purple)   |
| Assigned Date  | `creationTimestamp`       | Formatted date                       |
| Actions        | —                         | Manage / Delete buttons              |

## Access Control

- Only users whose `roles[]` includes `Platform.Admin` may access this view.
- Non-admin users see an "Access Denied" message.

## Configuration

Each Azure API entry in `src/config/apis.json` must include:

```json
"SERVICE_PRINCIPAL_OBJECT_ID": "<object-id-of-the-service-principal>"
```

## Azure AD App Registration Prerequisites

The app registration must have the following **delegated permissions** with admin consent:

- `https://graph.microsoft.com/Application.Read.All` — read service principal app role assignments
- `https://graph.microsoft.com/User.Read.All` — read user profiles (email, displayName)
- `https://graph.microsoft.com/Directory.Read.All` — read directory objects (groups, members)

## Error Handling

| Scenario                    | Behavior                                  |
|-----------------------------|------------------------------------------|
| Not Platform.Admin          | Show access-denied message               |
| Keycloak API selected       | Show "unsupported provider" message      |
| Missing SERVICE_PRINCIPAL_OBJECT_ID | Show configuration error message |
| API call fails (403/401)    | Show permission error with details       |
| Network error               | Show generic error with retry option     |
| Empty results               | Show "No users found" message            |
