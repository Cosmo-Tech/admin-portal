<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# cosmotech-admin-portal Helm Chart

Helm chart for deploying the Cosmo Tech Administration Portal on Kubernetes.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.x
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/) (if using Ingress)
- [cert-manager](https://cert-manager.io/) (for TLS with Let's Encrypt)

## Installation

```bash
helm install my-admin-portal webapp_server/charts/cosmotech-admin-portal \
  --namespace my-namespace \
  --set webapp.domainName=admin.example.com \
  --set webapp.server.image.repository=ghcr.io/cosmo-tech/admin-portal/webapp-server \
  --set webapp.server.image.tag=latest \
  --set-json 'config.apis={
    "my-environment": {
      "AUTH_KEYCLOAK_CLIENT_ID": "cosmotech-webapp-client",
      "AUTH_KEYCLOAK_REALM": "https://example.com/keycloak/realms/myrealm",
      "AUTH_KEYCLOAK_ROLES_JWT_CLAIM": "userRoles",
      "COSMOTECH_API_PATH": "https://example.com/cosmotech-api/v4"
    }
  }'
```

## Upgrade

```bash
helm upgrade my-admin-portal webapp_server/charts/cosmotech-admin-portal \
  --namespace my-namespace \
  -f my-values.yaml
```

## Values Reference

| Parameter | Description | Default |
|-----------|-------------|---------|
| `name` | Prefix for all K8s resources | `cosmotech-admin-portal` |
| `webapp.domainName` | Domain name for the Ingress host | `""` |
| `webapp.publicUrl` | URL path root (e.g. `/admin-portal`) | `""` |
| `webapp.server.replicaCount` | Number of pod replicas | `1` |
| `webapp.server.nodeSelector` | Node selector for scheduling | `{}` |
| `webapp.server.image.pullSecret` | Image pull secret name | `""` |
| `webapp.server.image.repository` | Container image repository | `""` |
| `webapp.server.image.tag` | Container image tag | `latest` |
| `webapp.server.image.pullPolicy` | Image pull policy | `Always` |
| `config.apis` | APIs configuration (overrides build-time `apis.json`) | `{}` |
| `ingress.enabled` | Deploy Ingress resource | `true` |
| `resources.limits.cpu` | CPU limit | `1000m` |
| `resources.limits.memory` | Memory limit | `256Mi` |
| `resources.requests.cpu` | CPU request | `200m` |
| `resources.requests.memory` | Memory request | `128Mi` |

## Runtime Configuration

The chart creates a **ConfigMap** from `config.apis` values, which is mounted into the pod at
`/webapp/patch_config/config/apis.json`. At container startup, the `patch_and_start_server.sh`
script reads this file and injects it into the built webapp as `window.publicWebappConfig.APIS`,
overriding the build-time default configuration.

### Config shapes

The `config.apis` value is a JSON object where each key is an environment name and the value
contains auth + API configuration. Two auth types are supported:

**Keycloak:**
```yaml
config:
  apis:
    my-keycloak-env:
      AUTH_KEYCLOAK_CLIENT_ID: "cosmotech-webapp-client"
      AUTH_KEYCLOAK_REALM: "https://example.com/keycloak/realms/myrealm"
      AUTH_KEYCLOAK_ROLES_JWT_CLAIM: "userRoles"
      COSMOTECH_API_PATH: "https://example.com/cosmotech-api/v4"
```

**Azure MSAL:**
```yaml
config:
  apis:
    my-azure-env:
      APP_REGISTRATION_CLIENT_ID: "00000000-0000-0000-0000-000000000000"
      AZURE_TENANT_ID: "00000000-0000-0000-0000-000000000000"
      COSMOTECH_API_SCOPE: "https://api.example.com/.default"
      COSMOTECH_API_PATH: "https://api.example.com/v3"
```

Multiple environments can be provided — the user selects one at login.
