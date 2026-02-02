# Copilot Instructions - Cosmo Tech Admin Portal

## Project Overview
React 19 + Redux Toolkit admin portal for managing Cosmo Tech workspace resources (organizations, workspaces, solutions, scenarios, users). Uses Vite as build tool, Material-UI for components, and supports multi-API/multi-auth environments.

## Architecture Patterns

### State Management: Redux with Dual Query Approaches
Two distinct patterns coexist for API calls:
1. **RTK Query** ([apiSlice.js](../src/state/api/apiSlice.js)) - New pattern using `createApi` with `fakeBaseQuery` and manual `queryFn`. Auto-generates hooks like `useGetAllSolutionsQuery`. Updates optimistically via `onQueryStarted`.
2. **Redux Thunks** ([organizations/thunks](../src/state/organizations/thunks), [workspaces/thunks](../src/state/workspaces/thunks)) - Legacy pattern where thunks receive API client via `extraArgument` from store config and manually dispatch reducer actions.

For new features, prefer RTK Query. Access API client in `queryFn` via `thunkAPI.extra.api`.

### Multi-API/Auth Architecture
[apiManager.js](../src/services/api/apiManager.js) is a singleton managing multiple Cosmo Tech environments defined in [apis.json](../src/config/apis.json). Automatically:
- Detects auth provider type (Azure MSAL vs Keycloak) from API config keys
- Initializes all auth providers on startup via `addAuthProvider` calls
- Persists selected API to localStorage under `authProvider` key
- Provides single API client instance via `getApiClient()`

The API client ([apiClient.js](../src/services/api/apiClient.js)) uses:
- Axios interceptors to inject Bearer tokens from `@cosmotech/core` Auth abstraction
- Automatic token refresh when < 3 minutes remaining
- Resource-specific factories from `@cosmotech/api-ts` (Solutions, Runners, Workspaces, Organizations, etc.)

### Authentication Flow
1. User selects API from [Login.jsx](../src/views/Login.jsx)
2. [login thunk](../src/state/auth/thunks/login.js) calls `Auth.setProvider()` and `Auth.signIn()` from `@cosmotech/core`
3. Auth data (email, ID, roles, status) stored in Redux `auth` slice
4. [UserStatusGate](../src/components/UserStatusGate/UserStatusGate.jsx) protects routes based on auth status constants from [state/auth/constants.js](../src/state/auth/constants.js)

## Development Workflow

### Package Management
**Critical:** Use `yarn` not npm. Project enforces `yarn@4.5.3` via `packageManager` field.

```powershell
yarn install    # Install dependencies
yarn start      # Dev server on port 3000
yarn build      # Production build
yarn lint       # Run ESLint
yarn prettier   # Format code
```

### File Headers
Every source file requires SPDX headers:
```javascript
// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
```

### Commit Conventions
**Strict enforcement:** A git hook blocks non-conforming commits. Use [Conventional Commits](../docs/coding-rules/conventional-commits.md):
- Types: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `build`, `ops`, `docs`, `chore`
- Format: `type(optional-scope): description`
- Tool: `git-conventional-commits@^1.0.0` (v1, NOT v2) installed globally
- Hook location: `.git-hooks/commit-msg` (activate via `git config core.hooksPath .git-hooks`)

Example: `feat(scenarios): add bulk rename functionality`

## Code Organization

### Component Structure
- [src/views/](../src/views/) - Page-level components (one per resource type)
- [src/components/](../src/components/) - Reusable UI components (AppBar, ErrorBoundary, UserStatusGate)
- [src/state/](../src/state/) - Redux slices with pattern: `reducers.js`, `hooks.js`, `thunks/` subfolder
- [src/services/](../src/services/) - API client, auth providers, config loaders

### State Slice Pattern
Each resource slice ([organizations](../src/state/organizations/), [workspaces](../src/state/workspaces/)) exports:
- Reducer from `reducers.js` (imported in [rootReducer.js](../src/state/rootReducer.js))
- Custom hooks from `hooks.js` (wrap `useSelector` for component consumption)
- Thunks in `thunks/` folder (one file per thunk function)

### Import Alias
[vite.config.js](../vite.config.js) defines `src: '/src'` alias. Use absolute imports:
```javascript
import { UserStatusGate } from 'src/components';
```

## Key Dependencies
- `@cosmotech/core` - Auth abstraction (works with Azure/Keycloak providers)
- `@cosmotech/azure` - MSAL implementation via `AuthMSAL` class
- `@cosmotech/api-ts` - TypeScript API client with resource factories
- React Router v7 - Uses `createBrowserRouter` API (see [AppRoutes.jsx](../src/AppRoutes.jsx))
- Redux Toolkit - Store configured with `serializableCheck: false` due to API client in `extraArgument`

## Documentation
- Full architecture: [docs/architecture/Architecture.md](../docs/architecture/Architecture.md)
- OpenAPI spec: [docs/architecture/openapi-5.0.0-rc5.json](../docs/architecture/openapi-5.0.0-rc5.json)
- Requirements: [docs/functional/Admin Portal Requirements.md](../docs/functional/Admin%20Portal%20Requirements.md)
