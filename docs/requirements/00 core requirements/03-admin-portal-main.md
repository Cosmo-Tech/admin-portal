<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Admin Portal Main View Requirements

The Admin Portal provides a centralized interface for platform management.

## 1. Global Navigation Bar

The main navigation bar provides direct access to the following core modules:
*   **Organizations** (Default View)
*   **Flowchart**
*   **Users**

## 2. Organizations Dashboard

The entry point (and default view) displays all accessible **Organizations**.

*   **Search/Filter:** Ability to filter organizations by API version (v3 vs v5).
*   **Organization Details:** Quick view of the number of active Workspaces and Solutions within each organization.
*   **Navigation:** Clicking on an organization card/row navigates to the [Organization View](./03-organization-view.md).

## 3. Users Management

A dedicated section for **Identity Management**, accessible via the "Users" navigation item:

*   Display a list of users fetched from the Keycloak Realm.
*   Ability to assign/remove users from platform-specific groups.

## 4. Platform Flowchart (Hierarchy View)

Accessible via the "Flowchart" navigation item, this dynamic chart visualizes the platform's object hierarchy. This chart **automatically adapts its structure** depending on whether the user is viewing an **API v3** or **API v5** environment.