<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->
# Organization View Requirements (API v5 Focus)

This document details the navigation flow and requirements once a specific organization is selected. These functionalities and object structures are specifically designed for the **API v5** architecture.

## 1. Organization Dashboard
Upon selecting an organization from the main page, the administrator is redirected to the Organization management view.

* **Navigation Bar:** A dedicated sidebar appears, providing direct access to **Solutions** and **Workspaces** belonging to the selected organization.
* **Contextual Filtering:** All data displayed in the following modules is strictly filtered by the active Organization ID to ensure multi-tenant isolation and security.

---

## 2. Solutions Management

This section describes the "Solutions" tab or module within the Organization View.

### 2.1 Solutions Table
The view presents a list of all solutions available in the organization.

**Columns:** **#TODO**
* **Name:** Name of the solution.
* **ID:** Unique technical identifier.
* **Version:** Version number of the solution.
* **Type:** Simulator engine type.
* **Creation Date:** Timestamp of when the solution was added.

### 2.2 Navigation
* **Interaction:** Clicking on a row in the Solutions table will navigate the user to the **[Solution View](./04-solutions-view.md)**, where they can manage run templates and other details.

---

## 3. Workspaces Management

This section describes the "Workspaces" tab or module within the Organization View.

### 3.1 Workspaces Table
The view presents a list of all operational workspaces within the organization.

**Columns:**
* **Name:** Display name of the workspace.
* **ID:** Unique technical identifier.
* **Solution:** Associated solution name.
* **Description:** Brief summary of the business use case.
* **Access Control:** Summary of assigned roles and permissions (ACL).

### 3.2 Navigation
* **Interaction:** Clicking on a row in the Workspaces table will navigate the user to the **[Workspace View](./05-workspaces-view.md)**, where they can manage runners and datasets.
