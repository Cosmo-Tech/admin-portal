<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Architecture Documentation

## Overview

The Cosmo Tech Administration Portal is a React-based web application built with modern tooling (Vite, Redux Toolkit) that provides an interface for managing Cosmo Tech workspace resources including organizations, workspaces, solutions, scenarios, and users.

## Technology Stack

### Core Framework
- **React 19.0.0** - UI framework
- **React Router 7.1.5** - Client-side routing
- **Vite 6.1.0** - Build tool and dev server

### State Management
- **Redux Toolkit 2.5.1** - Global state management
- **RTK Query** - API data fetching and caching
- **React Redux 9.2.0** - React bindings for Redux

### UI & Styling
- **Material-UI 6.4.4** - Component library
- **Emotion** - CSS-in-JS styling

### Authentication
- **@cosmotech/core** - Core authentication abstraction
- **@cosmotech/azure** - Azure MSAL authentication provider
- **MSAL Browser 3.26.1** - Microsoft Authentication Library
- **Keycloak** - Alternative authentication provider

### API Communication
- **@cosmotech/api-ts 3.2.9** - TypeScript API client
- **Axios 1.7.9** - HTTP client
- **jwt-decode 4.0.0** - JWT token decoding

## Architecture Layers

### 1. Presentation Layer (`src/views/`)
React components representing different resource management pages:
- [`Login.jsx`](../../src/views/Login.jsx) - API selection and authentication
- [`Organizations.jsx`](../../src/views/Organizations.jsx) - Organization listing
- [`Workspaces.jsx`](../../src/views/Workspaces.jsx) - Workspace listing
- [`Solutions.jsx`](../../src/views/Solutions.jsx) - Solution listing
- [`Scenarios.jsx`](../../src/views/Scenarios.jsx) - Scenario listing and management
- [`Users.jsx`](../../src/views/Users.jsx) - User listing
- [`ResourcesLayout.jsx`](../../src/views/ResourcesLayout.jsx) - Layout wrapper with navigation

### 2. Component Layer (`src/components/`)
Reusable UI components:
- [`AppBar`](../../src/components/AppBar/AppBar.jsx) - Navigation bar
- [`UserStatusGate`](../../src/components/UserStatusGate/UserStatusGate.jsx) - Authentication gate for protected routes
- [`ErrorBoundary`](../../src/components/ErrorBoundary/ErrorBoundary.jsx) - Error handling wrapper

### 3. State Management Layer (`src/state/`)

#### Redux Slices
- **auth** ([`reducers.js`](../../src/state/auth/reducers.js)) - Authentication state
  - User information (email, ID, name, profile picture)
  - Authentication status (ANONYMOUS, AUTHENTICATED, CONNECTING, etc.)
  - Roles and permissions
  
- **organizations** ([`reducers.js`](../../src/state/organizations/reducers.js)) - Organization data
  - Organization list
  - Loading status
  
- **workspaces** ([`reducers.js`](../../src/state/workspaces/reducers.js)) - Workspace data
  - Workspace list
  - Loading status

#### RTK Query API Slice
[`apiSlice.js`](../../src/state/api/apiSlice.js) provides:
- `getAllSolutions` - Fetch all solutions
- `getAllScenarios` - Fetch all scenarios (runners)
- `renameScenario` - Mutation to update scenario properties

#### Custom Hooks
Each state slice exposes custom hooks for component consumption:
- [`src/state/auth/hooks.js`](../../src/state/auth/hooks.js)
- [`src/state/organizations/hooks.js`](../../src/state/organizations/hooks.js)
- [`src/state/workspaces/hooks.js`](../../src/state/workspaces/hooks.js)

### 4. Service Layer (`src/services/`)

#### API Management
- [`apiManager.js`](../../src/services/api/apiManager.js) - Singleton managing API configuration and client instances
  - Multi-API support (can switch between different Cosmo Tech environments)
  - Auth provider initialization
  - Local storage persistence of selected API
  
- [`apiClient.js`](../../src/services/api/apiClient.js) - Axios-based API client factory
  - Automatic token injection via interceptors
  - Token refresh logic
  - API factories for different resource types (Solutions, Workspaces, Organizations, etc.)

- [`apiConfig.js`](../../src/services/api/apiConfig.js) - API configuration loader
  - Loads from [`src/config/apis.json`](../../src/config/apis.json)
  - Validates API configurations

#### Authentication Providers
- [`azure.js`](../../src/services/auth/azure.js) - Azure AD/MSAL provider configuration
- [`keycloak.js`](../../src/services/auth/keycloak.js) - Keycloak OIDC provider configuration

Both providers support dynamic configuration based on selected API.

### 5. Routing Layer
[`AppRoutes.jsx`](../../src/AppRoutes.jsx) defines application routes:
```
/ (UserStatusGate)
├── / (ResourcesLayout)
│   ├── / (index) → Users
│   ├── /solution → Solutions
│   ├── /workspace → Workspaces
│   ├── /organization → Organizations
│   └── /scenario → Scenarios
└── /sign-in → Login
```

## Data Flow

### Authentication Flow
1. User selects API from [`apis.json`](../../src/config/apis.json) configuration on [`Login`](../../src/views/Login.jsx) page
2. [`apiManager`](../../src/services/api/apiManager.js) initializes appropriate auth provider (Azure/Keycloak)
3. [`login`](../../src/state/auth/thunks/login.js) thunk triggers OAuth flow
4. [`Auth`](../../src/services/auth/) provider handles token acquisition
5. Auth state updated in Redux store via [`setAuthData`](../../src/state/auth/reducers.js)
6. [`UserStatusGate`](../../src/components/UserStatusGate/UserStatusGate.jsx) redirects based on auth status

### API Request Flow
1. Component dispatches action or calls RTK Query hook
2. Redux thunk/RTK Query accesses [`apiClient`](../../src/services/api/apiClient.js) from store's `extraArgument`
3. Axios interceptor injects authentication token
4. API request made to Cosmo Tech backend
5. Response updates Redux store
6. Component re-renders with new data

### State Update Patterns

#### Traditional Redux (Organizations, Workspaces)
- Async thunks (e.g., [`getAllWorkspaces`](../../src/state/workspaces/thunks/getAllWorkspaces.js))
- Manual loading state management
- Direct API client usage

#### RTK Query (Solutions, Scenarios)
- Declarative queries and mutations
- Automatic caching and loading states
- Optimistic updates (e.g., scenario rename)

## Configuration

### Multi-API Support
[`apis.json`](../../src/config/apis.json) allows configuration of multiple Cosmo Tech environments:
- Azure-based APIs (with tenant ID, client ID, scope)
- Keycloak-based APIs (with realm, client ID)

The [`apiManager`](../../src/services/api/apiManager.js) singleton:
- Detects auth provider type from configuration
- Initializes all providers on startup
- Persists selected API to localStorage
- Provides unified interface to access current API client

### Path Aliases
[`jsconfig.json`](../../jsconfig.json) and [`vite.config.js`](../../vite.config.js) configure `src/*` alias for cleaner imports:
```javascript
import { apiManager } from 'src/services/api/apiManager';
```

## Build & Development

### Development Server
- **Port**: 3000 (configured in [`vite.config.js`](../../vite.config.js))
- **Command**: `yarn start`

### Build Configuration
- **Bundler**: Vite with React plugin
- **Node Polyfills**: Enabled for browser compatibility
- **Output**: Static files in `dist/`

## Security Considerations

1. **Token Management**
   - Access tokens stored in localStorage via MSAL/Auth library
   - Automatic refresh before expiration (3-minute threshold)
   - Tokens injected per-request via Axios interceptors

2. **Authentication Gates**
   - [`UserStatusGate`](../../src/components/UserStatusGate/UserStatusGate.jsx) protects all resource routes
   - Redirect to `/sign-in` for unauthenticated users
   - Redirect to `/` for authenticated users on sign-in page

3. **Error Handling**
   - [`ErrorBoundary`](../../src/components/ErrorBoundary/ErrorBoundary.jsx) catches React component errors
   - API errors logged and returned in RTK Query error state
   - Token acquisition failures handled gracefully

## Future Considerations

1. **State Management Migration**
   - Consider migrating remaining slices (organizations, workspaces) to RTK Query for consistency
   
2. **Type Safety**
   - Add TypeScript for better type checking (currently using JSDoc)
   
3. **Testing**
   - Cypress already configured for E2E testing
   - Add unit tests for reducers, thunks, and components
   
4. **API Key Support**
   - Currently commented out in [`apiClient.js`](../../src/services/api/apiClient.js)
   - Could be enabled for non-OAuth scenarios

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vite.dev/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)