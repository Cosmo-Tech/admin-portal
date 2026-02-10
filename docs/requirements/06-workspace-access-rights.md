<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech --> 

The **Workspace ccess rights view** is a dedicated page for managing security access for **organizations, solutions, workspaces, runners, and datasets**.
On the same row, we will have:

* A field to choose the **email** of the user to grant access to
* A field with a list of **organization IDs**, and another field below with a list of **roles**
* A field with a list of **workspace IDs**, and another field below with a list of **roles**
* A field with a list of **runner IDs**, and another field below with a list of **roles**
* A field with a list of **dataset IDs**, and another field below with a list of **roles**

* A button **Update**, to send all the changements.

The user will be able to grant or deny access based on a few rules:

 * Based on their **Keycloak role**: if the user is a **Platform Admin**, they will always be able to grant access everywhere. 
 * Based on the default value if it's an **Admin** he can can modify access for the resource and its children.
 * If not, their ability to grant access depends on their role in the **access list**:
   * If the user is an **Admin**, they can modify access for the resource and its children.
   * If not, they will not be able to modify access.
 * The same logic applies to the other resources.

In V5:

* An organization has solutions and workspaces as children.

* A workspace has runners and datasets as children.

In V3:

* An organization has solutions, workspaces, and datasets as children.

* A workspace has runners or scenarios as children.