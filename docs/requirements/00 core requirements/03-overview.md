<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->
# **Cosmo Tech Platform Portal: Requirements**

## **1. Introduction**

The Cosmo Tech **Platform Portal** is a centralized suite of services for platform administrators. It is designed to oversee multiple organizations, manage global configurations, and ensure compliance.

The primary module is the **Admin Portal**, a web-based interface that provides an intuitive environment for managing the lifecycle of Cosmo Tech platform objects.

## **2. Platform Architecture & Multi-API Support**

The Admin Portal must act as a bridge between two distinct generations of the Cosmo Tech API, handling the transition between cloud-native and on-premise environments.

### **2.1 API Versions**

| **Feature** | **API v3** | **API v5** |
| :---: | :---: | :---: |
| **Deployment** | Azure (Cloud) | On-Premise / Self-Hosted |
| **Auth Provider** | Azure Active Directory (Microsoft Entra ID) | **Keycloak** |
| **Primary Objects** | Organizations, Solutions, Workspaces, Scenarios… | Organizations, Solutions, Workspaces, Runners, Runs |

### **2.2 Unified Authentication Flow**

The Admin Portal serves as a unified entry point. It must detect the target API version and route authentication requests to the appropriate provider (Azure AD for v3 or Keycloak for v5).  

**3. Keycloak User & Group Management**

The Admin Portal integrates directly with **Keycloak** to manage access control.

*   **User Management:** Administrators must be able to list, view, and manage users stored in Keycloak.
*   **Group Mapping:** The portal will manage Keycloak Groups, which correspond to platform roles (Admin, Editor, Viewer).
*   **Organization Isolation:** Users and groups must be filtered based on the selected Organization to ensure strict multi-tenant security.

## **4. Admin Portal: landing page Requirements**

The landing page of the Admin Portal provides a "high-level" overview of the platform resources.

### **4.1 Organizations lit**

The entry point displays all accessible **Organizations**.

*   **Search/Filter:** Ability to filter organizations by API version (v3 vs v5).
*   **Organization Details:** Quick view of the number of active Workspaces and Solutions within each organization.

### **4.2 Keycloak User Integration**

A dedicated section for **Identity Management**:

*   Display a list of users fetched from the Keycloak Realm.
*   Ability to assign/remove users from platform-specific groups.

### **4.3 Platform Flowchart (Hierarchy View)**

The portal features a dynamic flowchart that visualizes the platform's object hierarchy. This chart **automatically adapts its structure** depending on whether the user is viewing an **API v3** or **API v5** environment. #**TO CONTINUE**


# 5. Organization Drill-Down (API v5 Focus)

This section details the navigation flow once a specific organization is selected. These functionalities and object structures are specifically designed for the **API v5** architecture.

## 5.1 Organization Dashboard
Upon selecting an organization from the main page, the administrator is redirected to the Organization management view.

* **Navigation Bar:** A dedicated sidebar appears, providing direct access to **Solutions** and **Workspaces** belonging to the selected organization.
* **Contextual Filtering:** All data displayed in the following modules is strictly filtered by the active Organization ID to ensure multi-tenant isolation and security.

---

## 5.2 Module "Solutions"
Management of simulation definitions and logic attached to the organization.

### 5.2.1 Solutions Table View
A comprehensive list of available solutions within the organization.
* **Columns:** * **Name:** Name of the solution. **#TODO**
    * **ID:** Unique technical identifier.
    * **Version:** Version number of the solution.
    * **Type:** Simulator engine type.
    * **Creation Date:** Timestamp of when the solution was added.
* **Actions:** Add (Upload JSON/YAML), Update, and Delete.**#TODO**

### 5.2.2 Solution Detail View
Triggered by clicking on a specific solution row.
* **#TODO: Overview:** (Reserved section for technical metadata and general description).
* **Run Templates:** A list of execution templates declared within the solution file, defining how simulations can be run.

---

## 5.3 Module "Workspaces"
The Workspace is the contextual analysis space linked to a specific solution. It is the primary area for operational tasks.

### 5.3.1 Workspaces Table View
A central hub for managing all workspaces within the organization.
* **Columns:**   **#TODO**
    * **Name:** Display name of the workspace.
    * **ID:** Unique technical identifier.
    * **Solution:** Associated solution name (clickable link for quick navigation).
    * **Description:** Brief summary of the business use case.
    * **Access Control:** Summary of assigned roles and permissions (ACL).
* **CRUD Management:** Dedicated interface buttons to **Add** a new workspace, **Update** existing configurations, or **Archive/Delete**.

### 5.3.2 Workspace Detail View
Opening a workspace provides access to its specific operational components:

#### **A. Runners**
* **Runners Table:** Displays all runners created within this workspace.
* **Management:** Capability to create new runners, configure security access per runner, and monitor execution statuses.

#### **B. Datasets**
* **Datasets Table:** Lists all data sources linked to the workspace.
    * **Supported Types:** Local files, Databases, Azure Digital Twins (ADT) links, etc.
* **Data Management:** * **Association:** Ability to link/associate a specific dataset to a Runner for execution.
    * **Updates:** Modify the data source parameters (e.g., changing a connection string or uploading a new file version).


