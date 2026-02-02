<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->
# Admin Portal Overview
The "Admin Portal" is a web-based interface designed for administrators to manage and oversee various aspects of the Cosmo Tech platform. It provides an intuitive and user-friendly environment for configuring the objects used by the Cosmo Tech platform:
- organizations
- solutions
- workspaces
- runners
- runs

Mock-ups
You can find the mock-ups for the Admin Portal [here](https://www.figma.com/proto/Wna4gI78OCyHc0rO2V1qNq/Admin-Portal)
They are downloaded locally in the repository under docs/mock-ups/



# Multi API and Multi Auth
The Admin Portal supports 2 major API versions : API v3 and API v5.


Authentication Provider
The Admin Portal supports 2 authentication providers : Azure for API v3 and Keycloak for API v5.

# Core Concepts in API v5

## Organizations

Simulation Digital Twin Organizations are logical groups of platform resources securely isolated from one another within the same cloud tenant and subscription. An Organization defines a company or legal entity and can contain resources for multiple Solutions. It serves as the core of multi-tenant security and manages the hierarchy of workspaces and solutions. User permissions are managed at this level using access-control lists (ACL) with roles such as Viewer, User, Editor, and Admin.

## Solutions

A Simulation Digital Twin Solution is software supporting decision-making that provides projections of strategy outcomes using a digital representation of the system and its dynamics. From a developer's perspective, a solution combines the source code of a simulator with at least one run template. It defines the parameters available for a scenario, how to validate a model, and how to execute the engine. Solutions are configured using JSON or YAML files to declare elements such as run templates and parameter groups.

## Workspaces
A Workspace defines an analysis or project space that is bound to a Solution. It contextualises business use cases with a web application, dashboard definitions, and available run templates. Workspaces contain Scenarios and require dedicated Azure resources, such as Azure Digital Twins, Event Hubs, or Azure Data Explorer, to function properly. Access permissions are enforced at the workspace level, requiring users to be added to the security list to read workspace resources.

## Runners
A Runner is a component hierarchically situated under a workspace that allows the execution of run templates, such as ETL scripts. To create a valid runner, one must reference a valid dataset, a run template defined in the Solution object, and define security access. Access to runners requires specific permissions, needing at least viewer rights on the organization and user rights on the workspace containing the runner.

## Runs
A Run (or Scenario Run) is the execution of a scenario. It combines a Dataset with a Run type within the context of a Simulator to perform the necessary computations. The run produces simulation results, which are projections of the system's state over a defined period used to compute KPIs. A run can have a status of Successful, Running, Pending (scheduled but blocked by resource unavailability), or Failed.

# Core Concepts in API v3
Starting with version v3.3, the concepts are similar to API v5.
TODO : mark any notable differences here

