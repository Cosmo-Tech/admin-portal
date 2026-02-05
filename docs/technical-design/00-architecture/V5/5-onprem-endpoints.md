<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# API v5 Technical Specifications (On-Prem / Keycloak)

This document defines the models and endpoints used by the Admin Portal to manage the platform. It is based on the `@cosmotech/api-ts@5.0.0-rc5` library.

**CRITICAL REFERENCE:** This document provides a high-level mapping for development. For exhaustive technical details, including full schemas, field constraints, and example payloads, refer to the source OpenAPI file:

📄 `docs_orgn/api-specs/V5/openapi-5.0.0-rc5.json`

## 1. Base API Information

- **Version:** 5.0.1-SNAPSHOT
- **Auth Provider:** Keycloak (Bearer Token via OAuth2)
- **Client Library:** `@cosmotech/api-ts`

## 2. Core Data Models (Schemas)

### 2.1 Organization

The root object for multi-tenancy.

```typescript
interface Organization {
  id: string; // Pattern: ^o-\w{10,20}
  name: string;
  security: {
    default: string; // e.g., 'none', 'viewer', 'user', 'editor', 'admin'
    accessControlList: Array<{ id: string; role: string }>;
  };
}
```

### 2.2 Solution

The simulation engine definition.

```typescript
export interface Solution {
  id: string; // Pattern: ^sol-\w{10,20}
  key: string;
  name: string;
  description?: string;
  version: string;
  repository: string;
  runTemplates: Array<{
    id: string;
    name: string;
    description?: string;
    // Other properties like tags, computeSize, parameterGroups
  }>;
}
```

### 2.3 Workspace

The business context linking a Solution to specific datasets.

```typescript
export interface Workspace {
  id: string; // Pattern: ^w-\w{10,20}
  key: string;
  name: string;
  description?: string;
  organizationId: string;
  solution: {
    solutionId: string; // Linked Solution ID
    datasetId?: string; // Optional linked Dataset ID
    defaultParameterValues?: Record<string, string>;
  };
}
```

### 2.4 Runner (v5 Specific)

An execution entity for running simulations or ETLs.

```typescript
export interface Runner {
  id: string; // Pattern: ^(r|s)-\w{10,20}
  name: string;
  description?: string;
  organizationId: string;
  workspaceId: string;
  solutionId: string;
  runTemplateId: string;
  validationStatus: 'Draft' | 'Rejected' | 'Unknown' | 'Validated';
}
```

## 3. Key API Endpoints Mapping

The Admin Portal uses the following routes from the OrganizationApi, WorkspaceApi, and RunnerApi classes. 

**Note:** Path parameters follow the `snake_case` naming convention from the OpenAPI spec.

### 3.1. Organizations (Multi-tenancy)

| Méthode | Endpoint | Description |
|:--------|:---------|:------------|
| `GET` | `/organizations` | Lister toutes les organisations (pagination via page, size) |
| `GET` | `/organizations/{organization_id}` | Récupérer les détails d'une organisation |
| `POST` | `/organizations` | Créer une nouvelle organisation |
| `PATCH` | `/organizations/{organization_id}` | Modifier une organisation (nom) |
| `DELETE` | `/organizations/{organization_id}` | Supprimer une organisation |
| `GET` | `/organizations/{organization_id}/security` | Lister la sécurité (ACL) de l'organisation |
| `POST` | `/organizations/{organization_id}/security/access` | Ajouter un contrôle d'accès à l'organisation |

### 3.2. Solutions (Logic & Simulation)

| Méthode | Endpoint | Description |
|:--------|:---------|:------------|
| `GET` | `/organizations/{organization_id}/solutions` | Lister toutes les solutions |
| `GET` | `/organizations/{organization_id}/solutions/{solution_id}` | Détails d'une solution spécifique |
| `POST` | `/organizations/{organization_id}/solutions` | Créer une solution |
| `PATCH` | `/organizations/{organization_id}/solutions/{solution_id}` | Mettre à jour une solution |
| `DELETE` | `/organizations/{organization_id}/solutions/{solution_id}` | Supprimer une solution |

### 3.3. Workspaces (Operational Context)

| Méthode | Endpoint | Description |
|:--------|:---------|:------------|
| `GET` | `/organizations/{organization_id}/workspaces` | Lister les workspaces d'une organisation |
| `GET` | `/organizations/{organization_id}/workspaces/{workspace_id}` | Détails d'un workspace |
| `POST` | `/organizations/{organization_id}/workspaces` | Créer un workspace |
| `PATCH` | `/organizations/{organization_id}/workspaces/{workspace_id}` | Modifier un workspace |
| `DELETE` | `/organizations/{organization_id}/workspaces/{workspace_id}` | Supprimer un workspace |
| `GET` | `/organizations/{organization_id}/workspaces/{workspace_id}/security` | Consulter la sécurité du workspace |

### 3.4. Runners (v5 Execution Engine)

| Méthode | Endpoint | Description |
|:--------|:---------|:------------|
| `GET` | `/organizations/{organization_id}/workspaces/{workspace_id}/runners` | Lister les runners d'un workspace |
| `GET` | `/organizations/{organization_id}/workspaces/{workspace_id}/runners/{runner_id}` | Détails d'un runner |
| `POST` | `/organizations/{organization_id}/workspaces/{workspace_id}/runners` | Créer un nouveau runner |
| `PATCH` | `/organizations/{organization_id}/workspaces/{workspace_id}/runners/{runner_id}` | Modifier un runner |
| `DELETE` | `/organizations/{organization_id}/workspaces/{workspace_id}/runners/{runner_id}` | Supprimer un runner |
| `POST` | `/organizations/{organization_id}/workspaces/{workspace_id}/runners/{runner_id}/start` | Lancer une exécution (Run) |
| `POST` | `/organizations/{organization_id}/workspaces/{workspace_id}/runners/{runner_id}/stop` | Arrêter la dernière exécution |

### 3.5. Datasets & Connectors

| Méthode | Endpoint | Description |
|:--------|:---------|:------------|
| `GET` | `/organizations/{organization_id}/workspaces/{workspace_id}/datasets` | Lister les datasets liés au workspace |
| `POST` | `/organizations/{organization_id}/workspaces/{workspace_id}/datasets` | Créer un nouveau dataset |
| `DELETE` | `/organizations/{organization_id}/workspaces/{workspace_id}/datasets/{dataset_id}` | Supprimer un dataset |
| `GET` | `/organizations/{organization_id}/connectors` | Lister les connecteurs disponibles |

---

## 4. Integration Guidelines for Copilot

- **Hierarchy Awareness:** Every API call for Workspaces, Solutions, or Runners must include the `organization_id` in the path as defined in the spec.
- **Keycloak Integration:**
  - Tokens are passed in the `Authorization: Bearer <token>` header.
  - User identities in the `security.accessControlList` refer to Keycloak `id` (often an email or sub).
- **Pagination:** For lists (Organizations, Workspaces, Runners), use the `page` and `size` query parameters.
- **State Management:** When a Runner's last run is `Running`, the portal should poll the `/status` endpoint of the Run to update the UI.



## old file 
<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

The data (organizations, solutions, workspaces) is provided by the Cosmo Tech API. We will use the v5 of the API.

The portal admin uses the official TypeScript client library: [@cosmotech/api-ts]  
https://www.npmjs.com/package/@cosmotech/api-ts/v/5.0.0-rc5 .

The
