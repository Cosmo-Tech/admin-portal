<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Cosmo Tech Admin Portal — Webapp Server

The server for the Cosmo Tech Administration Portal uses **nginx** to serve a static Single Page
Application built with React + Vite.

## Build type options

This server supports two build modes: "_specific_" (default) and "_universal_".

The **"specific"** mode is the most straightforward for one-shot deployments (i.e. during
development):
- the server is **configured at build time** (using `src/config/apis.json`)
- the generated image is self-sufficient and ready-to-use when deployed

The **"universal"** mode aims to build **an image that can be used for multiple environments**:
- the server is **NOT** configured at build time
- the built webapp is **patched at container startup** using configuration from a mounted directory
- a ConfigMap must be mounted when running the container in Kubernetes
- the generated image can be reused across environments

## Local build & run

### Server in "specific" mode

```bash
# From the repository root
cd admin-portal

# Optional: add build number in app version
VITE_BUILD_NUMBER=$(git rev-parse --short HEAD)

# Build the docker image (specific mode is the default target)
DOCKER_BUILDKIT=1 docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg VITE_BUILD_NUMBER=$VITE_BUILD_NUMBER \
  -t admin-portal-server \
  -f webapp_server/webapp-server.Dockerfile .

# Run the container
docker run --rm -it -p 8080:80 admin-portal-server
```

The portal should be available at `http://localhost:8080`.

### Server in "universal" mode

```bash
# From the repository root
cd admin-portal

# Optional: add build number in app version
VITE_BUILD_NUMBER=$(git rev-parse --short HEAD)

# Build the docker image targeting universal mode
DOCKER_BUILDKIT=1 docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg VITE_BUILD_NUMBER=$VITE_BUILD_NUMBER \
  --target server-universal \
  -t admin-portal-server \
  -f webapp_server/webapp-server.Dockerfile .

# Run the container with a local config directory mounted
docker run --rm -it -p 8080:80 \
  --mount type=tmpfs,destination=/tmp/webapp \
  -v /absolute/path/to/config_dir:/webapp/patch_config \
  admin-portal-server
```

The mounted config directory should contain:
```
config_dir/
└── config/
    └── apis.json
```

Where `apis.json` has the same structure as `src/config/apis.json`:
```json
{
  "my-environment": {
    "AUTH_KEYCLOAK_CLIENT_ID": "cosmotech-webapp-client",
    "AUTH_KEYCLOAK_REALM": "https://example.com/keycloak/realms/myrealm",
    "AUTH_KEYCLOAK_ROLES_JWT_CLAIM": "userRoles",
    "COSMOTECH_API_PATH": "https://example.com/cosmotech-api/v4"
  }
}
```

## Kubernetes deployment

See the [Helm chart documentation](charts/cosmotech-admin-portal/README.md) for deploying to
Kubernetes with Helm.

## How runtime config injection works

1. The `index.html` contains a placeholder: `<script id="publicWebappConfigElement"></script>`
2. At container startup, `scripts/patch_webapp_server/patch_and_start_server.sh` runs:
   - Copies the build output to a writable working directory (`/tmp/webapp/build`)
   - Reads `apis.json` from the ConfigMap mount (`/webapp/patch_config/config/apis.json`)
   - Generates a JavaScript file that sets `window.publicWebappConfig = { APIS: ... }`
   - Patches `index.html` to replace the placeholder script tag with a `<script src="...">` tag
3. nginx serves the patched build
4. The application's `apiConfig.js` checks `window?.publicWebappConfig?.APIS` first, falling back
   to the build-time `src/config/apis.json` if not present

This pattern is inspired by the
[Cosmo Tech Business Webapp](https://github.com/Cosmo-Tech/azure-sample-webapp/tree/main/webapp_server).
