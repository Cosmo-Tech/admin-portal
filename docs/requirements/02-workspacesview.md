<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Workspaces View Requirements

## 1. Module "Workspaces"
After choosing an organization, the user sees a list of its workspaces.

### 1.1 Page Header
* **Top Left**: An **Organization Selector** to view or switch the current organization.
* **Top Right**: An **"Add Workspace"** button to initiate creation.

### 1.2 Workspaces List Table
* **ID**: Unique technical ID.
* **Name**: Display name.
* **Actions**: Buttons for **Manage** and **Delete**.

### 1.3 Key Features
* **Add Workspace**: Clicking the button opens a **pop-up (Add Workspace modal)**.
* **Manage Action**: Clicking "Manage" opens a **pop-up (Manage modal)** to edit settings (detailed in Manage View).
* **Row Navigation**: Clicking a row takes the user to a new page: the **Workspace Detail View**.
* **Access Control**: Buttons are only visible if the user has the required permissions.