<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->
# Workspaces View Requirements

## 1. Module "Workspaces"
The Workspace is the contextual analysis space linked to a specific solution. It is the primary area for operational tasks.

### 1.1 Workspaces Table View
A central hub for managing all workspaces within the organization.

* **Columns:** **#TODO: Verify column list**
    * **Name:** Display name of the workspace.
    * **ID:** Unique technical identifier.
    * **Solution:** Associated solution name (clickable link for quick navigation).
    * **Description:** Brief summary of the business use case.
    * **Access Control:** Summary of assigned roles and permissions (ACL).
* **CRUD Management:** Dedicated interface buttons to **Add** a new workspace, **Update** existing configurations, or **Archive/Delete**.

### 1.2 Workspace Detail View
Opening a workspace provides access to its specific operational components:

#### A. Runners
* **Runners Table:** Displays all runners created within this workspace.
* **Management:** Capability to create new runners, configure security access per runner, and monitor execution statuses.

#### B. Datasets
* **Datasets Table:** Lists all data sources linked to the workspace.
    * **Supported Types:** Local files, Databases, Azure Digital Twins (ADT) links, etc.
* **Data Management:** 
    * **Association:** Ability to link/associate a specific dataset to a Runner for execution.
    * **Updates:** Modify the data source parameters (e.g., changing a connection string or uploading a new file version).
