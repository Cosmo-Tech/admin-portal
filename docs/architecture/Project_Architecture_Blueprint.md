# Project Architecture Blueprint

**Cosmo Tech Administration Portal**

---

**Document Version:** 1.0  
**Generated:** January 29, 2026  
**Project Version:** 0.1.0-dev  
**Primary Technologies:** React 19, Redux Toolkit, Material UI 6, Vite

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Architecture Visualization](#architecture-visualization)
4. [Core Architectural Components](#core-architectural-components)
5. [Architectural Layers and Dependencies](#architectural-layers-and-dependencies)
6. [Data Architecture](#data-architecture)
7. [Cross-Cutting Concerns Implementation](#cross-cutting-concerns-implementation)
8. [Service Communication Patterns](#service-communication-patterns)
9. [React-Specific Architectural Patterns](#react-specific-architectural-patterns)
10. [Implementation Patterns](#implementation-patterns)
11. [Testing Architecture](#testing-architecture)
12. [Deployment Architecture](#deployment-architecture)
13. [Extension and Evolution Patterns](#extension-and-evolution-patterns)
14. [Architectural Pattern Examples](#architectural-pattern-examples)
15. [Architectural Decision Records](#architectural-decision-records)
16. [Architecture Governance](#architecture-governance)
17. [Blueprint for New Development](#blueprint-for-new-development)

---

## Executive Summary

The Cosmo Tech Administration Portal is a **React 19** single-page application (SPA) built with a **feature-based architecture** that emphasizes separation of concerns, unidirectional data flow, and testability. The application follows modern React best practices with **Redux Toolkit** for state management, **Material UI 6** for the component library, and **Vite** as the build tool.

### Key Architectural Characteristics

- **Architecture Pattern:** Feature-Based Layered Architecture with Redux Flux pattern
- **State Management:** Redux Toolkit with both Thunks and RTK Query
- **Component Model:** Functional components with React Hooks
- **Authentication:** Multi-provider (Azure MSAL, Keycloak) with Auth abstraction layer
- **API Integration:** Axios-based client with auto-generated TypeScript SDK
- **Routing:** React Router 7 with nested routes and route guards
- **Build System:** Vite with React Fast Refresh and ES modules

### Architectural Principles

1. **Separation of Concerns:** Clear boundaries between UI, state, services, and API layers
2. **Dependency Injection:** API client injected via Redux middleware `extraArgument`
3. **Single Source of Truth:** Redux store as the authoritative state container
4. **Unidirectional Data Flow:** Actions → Reducers → State → UI
5. **Composition over Inheritance:** Component composition and custom hooks
6. **Feature-Based Organization:** Code organized by domain features, not technical layers

---

## Architecture Overview

### High-Level Architecture

The application follows a **feature-based layered architecture** with clear separation between:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  (React Components, Views, Material UI)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │ React Hooks (useSelector, useDispatch)
┌───────────────────────▼─────────────────────────────────────┐
│                    State Management Layer                    │
│  (Redux Store, Slices, Reducers, Actions)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ Thunks / RTK Query
┌───────────────────────▼─────────────────────────────────────┐
│                     Service/API Layer                        │
│  (API Manager, API Client, Auth Services)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ Axios HTTP Client
┌───────────────────────▼─────────────────────────────────────┐
│                    External Services                         │
│  (Cosmo Tech API, Auth Providers: Azure AD, Keycloak)       │
└─────────────────────────────────────────────────────────────┘
```

### Guiding Principles

1. **UI components never directly call APIs** - All API interactions flow through Redux (thunks or RTK Query)
2. **State is normalized and feature-scoped** - Each feature (auth, organizations, workspaces) owns its state slice
3. **Custom hooks encapsulate Redux logic** - Components use semantic hooks, not raw Redux primitives
4. **Authentication is provider-agnostic** - Auth abstraction layer (`@cosmotech/core`) supports multiple providers
5. **Configuration is externalized** - API configurations loaded from JSON, enabling multi-environment deployments

### Architectural Boundaries

| Boundary           | Enforcement Mechanism                                        |
| ------------------ | ------------------------------------------------------------ |
| UI → State         | React hooks (`useSelector`, `useDispatch`) - one-way binding |
| State → Service    | Redux middleware `extraArgument` - dependency injection      |
| Service → External | Axios interceptors - centralized auth, error handling        |
| Route → Component  | Route guards (`UserStatusGate`) - declarative authorization  |

---

## Architecture Visualization

### System Context Diagram (C4 Level 1)

```
                        ┌─────────────────┐
                        │                 │
                        │   End User      │
                        │   (Admin)       │
                        │                 │
                        └────────┬────────┘
                                 │
                                 │ HTTPS
                                 │
                    ┌────────────▼──────────────┐
                    │                           │
                    │  Admin Portal Web App     │
                    │  (React 19 SPA)           │
                    │                           │
                    └────────────┬──────────────┘
                                 │
                                 │ HTTPS/REST
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
        ▼                        ▼                         ▼
┌───────────────┐      ┌──────────────────┐     ┌─────────────────┐
│               │      │                  │     │                 │
│  Azure AD     │      │  Cosmo Tech API  │     │   Keycloak      │
│  (Auth)       │      │  (REST API)      │     │   (Auth)        │
│               │      │                  │     │                 │
└───────────────┘      └──────────────────┘     └─────────────────┘
```

### Container Diagram (C4 Level 2)

```
┌────────────────────────────────────────────────────────────────┐
│                       Admin Portal SPA                         │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │              │  │              │  │                  │    │
│  │  UI Layer    │  │  State Layer │  │  Service Layer   │    │
│  │  (React)     │◄─┤  (Redux)     │◄─┤  (API Manager)   │    │
│  │              │  │              │  │                  │    │
│  └──────────────┘  └──────────────┘  └────────┬─────────┘    │
│         │                 │                     │              │
│         │                 │                     │              │
└─────────┼─────────────────┼─────────────────────┼──────────────┘
          │                 │                     │
          │                 │                     │ HTTP/REST
          │                 │                     │
          │                 │            ┌────────▼────────────┐
          │                 │            │                     │
          │                 │            │  Cosmo Tech API     │
          │                 │            │  (@cosmotech/api-ts)│
          │                 │            │                     │
          │                 │            └─────────────────────┘
          │                 │
          │ OAuth2/OIDC     │ OAuth2/OIDC
          │ Redirect        │ Token Exchange
          │                 │
    ┌─────▼──────┐    ┌─────▼──────┐
    │            │    │            │
    │  Azure AD  │    │  Keycloak  │
    │            │    │            │
    └────────────┘    └────────────┘
```

### Component Diagram - State Management (C4 Level 3)

```
┌────────────────────────────────────────────────────────────────┐
│                        Redux Store                             │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ auth         │  │organizations │  │  workspaces      │    │
│  │ slice        │  │ slice        │  │  slice           │    │
│  │              │  │              │  │                  │    │
│  │ - status     │  │ - list[]     │  │ - list[]         │    │
│  │ - userEmail  │  │ - status     │  │ - status         │    │
│  │ - userId     │  │              │  │                  │    │
│  │ - roles[]    │  │              │  │                  │    │
│  └──────────────┘  └──────────────┘  └──────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           RTK Query - cosmoApi slice                 │    │
│  │                                                      │    │
│  │  Endpoints:                                          │    │
│  │  - getAllSolutions (query)                           │    │
│  │  - getAllScenarios (query)                           │    │
│  │  - renameScenario (mutation)                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │            Middleware Layer                          │    │
│  │                                                      │    │
│  │  - Thunk middleware (extraArgument: { api })         │    │
│  │  - RTK Query middleware (cache management)           │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram - User Action to API Call

```
┌──────────────┐
│  User clicks │
│  button in   │──┐
│  Component   │  │
└──────────────┘  │
                  │
                  ▼
         ┌─────────────────┐
         │ Custom Hook     │
         │ dispatches      │
         │ thunk/action    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Redux Store     │
         │ invokes thunk   │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Thunk function  │
         │ receives api    │
         │ from extra args │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ API Client      │
         │ makes HTTP call │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Axios           │
         │ Interceptor     │
         │ adds auth token │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ External API    │
         │ processes req   │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Response flows  │
         │ back to thunk   │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Reducer updates │
         │ state           │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Component       │
         │ re-renders with │
         │ new state       │
         └─────────────────┘
```

---

## Core Architectural Components

### 1. Presentation Layer (UI Components)

#### Purpose and Responsibility

- Render user interface using Material UI components
- Handle user interactions and form inputs
- Display application state from Redux store
- Route-based navigation and layouts
- Internationalization (i18n) support

#### Internal Structure

- **Views** (`src/views/`): Page-level components for each route
  - `Login.jsx`: Authentication page with API selection
  - `Organizations.jsx`: Organization list view
  - `Workspaces.jsx`: Workspace list view
  - `ResourcesLayout.jsx`: Layout wrapper with navigation
- **Components** (`src/components/`): Reusable UI components
  - `AppBar`: Application header with branding
  - `NavigationMenu`: Sidebar navigation
  - `ErrorBoundary`: Error handling component
  - `UserStatusGate`: Route guard for authentication
  - `LanguageSwitcher`: Locale selection

#### Interaction Patterns

- Components **never directly call APIs** - they dispatch actions via custom hooks
- Use `useSelector` for reading state, `useDispatch` for actions
- Composition pattern: smaller components composed into layouts
- Conditional rendering based on authentication and loading states
- Material UI's `sx` prop for styling (no separate CSS files for components)

#### Evolution Patterns

- Add new views in `src/views/` and register routes in `AppRoutes.jsx`
- Create reusable components in `src/components/` with named exports
- Use MUI theme customization in `src/themes/` for global styling
- Extend i18n by adding translations to `src/i18n/locales/{lang}/common.json`

---

### 2. State Management Layer (Redux)

#### Purpose and Responsibility

- Single source of truth for application state
- Manage async operations (API calls) via thunks and RTK Query
- Provide predictable state updates through reducers
- Enable time-travel debugging and state inspection

#### Internal Structure

**Feature Slices** (`src/state/{feature}/reducers.js`):

- `auth`: User authentication state (status, user info, roles)
- `organizations`: Organization list and loading status
- `workspaces`: Workspace list and loading status
- `cosmoApi`: RTK Query slice for API endpoints

**Thunks** (`src/state/{feature}/thunks/{action}.js`):

- Async action creators that access API via `extraArgument`
- Example: `getAllOrganizations()`, `login()`

**Hooks** (`src/state/{feature}/hooks.js`):

- Custom hooks that encapsulate Redux logic
- Selector hooks: `useOrganizationsList()`, `useAuthStatus()`
- Action hooks: `useGetAllOrganizations()`, `useLogin()`

**Store Configuration** (`src/state/store.config.js`):

- Redux Toolkit `configureStore` with middleware setup
- Dependency injection via `extraArgument: { api }`
- RTK Query middleware integration

#### Interaction Patterns

- Components dispatch actions via custom hooks
- Thunks receive injected API client from `extraArgument`
- Reducers update state immutably (Immer built-in)
- RTK Query manages cache automatically with optimistic updates

#### Key Design Decisions

1. **Manual thunks vs createAsyncThunk**: Simple cases use manual thunks; complex async flows use `createAsyncThunk`
2. **RTK Query for queries/mutations**: Used for scenarios requiring cache management and optimistic updates
3. **Feature-based slices**: Each domain (auth, organizations) has its own slice
4. **Status flags**: `IDLE`, `LOADING`, `ERROR` for async operation tracking

---

### 3. Service Layer (API Integration)

#### Purpose and Responsibility

- Abstract API communication from business logic
- Manage multiple API configurations (multi-environment support)
- Handle authentication provider selection and configuration
- Inject authentication tokens into HTTP requests
- Manage token lifecycle (refresh, expiry)

#### Internal Structure

**API Manager** (`src/services/api/apiManager.js`):

- Singleton pattern with private fields
- Loads API configurations from `src/config/apis.json`
- Initializes auth providers for each API (Azure, Keycloak)
- Provides selected API client to Redux store

**API Client** (`src/services/api/apiClient.js`):

- Creates Axios instance with interceptors
- Generates API factory methods from `@cosmotech/api-ts`
- Injects authentication headers on every request
- Implements proactive token refresh (3 minutes before expiry)

**API Configuration** (`src/services/api/apiConfig.js`):

- Loads and validates API configurations
- Supports multiple environments (dev, prod, etc.)

**Auth Providers** (`src/services/auth/`):

- `azure.js`: Azure MSAL configuration
- `keycloak.js`: Keycloak OIDC configuration
- Both integrate with `@cosmotech/core` Auth singleton

#### Interaction Patterns

- Redux thunks access API client via `extraArgument.api`
- RTK Query queries access API client via `thunkAPI.extra.api`
- API client automatically adds auth headers via interceptors
- Auth providers dynamically registered based on API config

#### Evolution Patterns

- Add new API factories by extending `getApiClient()` function
- Add new auth providers by creating new files in `src/services/auth/`
- Extend API configurations in `src/config/apis.json`

---

### 4. Routing Layer

#### Purpose and Responsibility

- Define application navigation structure
- Protect routes based on authentication status
- Provide layouts for groups of routes
- Enable nested routing patterns

#### Internal Structure

**AppRoutes** (`src/AppRoutes.jsx`):

- Uses React Router 7 data router pattern
- Defines route hierarchy with nested routes
- Integrates `UserStatusGate` for authentication
- Layout routes (`ResourcesLayout`) with shared UI

**Route Structure**:

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

**Route Guards** (`UserStatusGate`):

- Redirects unauthenticated users to `/sign-in`
- Redirects authenticated users away from `/sign-in`
- Wraps protected routes in `ErrorBoundary`

#### Interaction Patterns

- `Navigate` component for programmatic redirects
- `useLocation` hook for location-aware logic
- `Outlet` component for nested route rendering
- `Link` component for navigation

---

### 5. Authentication & Authorization Layer

#### Purpose and Responsibility

- Support multiple authentication providers (Azure AD, Keycloak)
- Abstract provider-specific logic via `@cosmotech/core` Auth singleton
- Manage authentication state in Redux
- Protect routes and API calls with authentication checks
- Store authentication provider selection in localStorage

#### Internal Structure

**Auth State** (`src/state/auth/`):

- Redux slice with user info, roles, permissions, status
- Login thunk using `createAsyncThunk`
- Custom hooks for auth operations and status checks

**Auth Singleton** (`@cosmotech/core`):

- Provider-agnostic auth abstraction
- Methods: `signIn()`, `signOut()`, `isUserSignedIn()`, `acquireTokens()`
- Provider registration: `Auth.addProvider()`, `Auth.setProvider()`

**Provider Configuration**:

- Azure MSAL: OAuth2 with redirect flow
- Keycloak: OIDC with redirect flow
- Dynamic configuration from API config JSON

#### Interaction Patterns

1. User selects API from login screen
2. `ApiManager` selects and configures auth provider
3. User clicks login → `login` thunk invoked
4. Auth provider initiates OAuth/OIDC flow
5. On return, tokens stored in localStorage
6. Axios interceptor adds tokens to API requests
7. Token refresh happens proactively before expiry

---

### 6. Internationalization Layer

#### Purpose and Responsibility

- Support multiple languages (English, French)
- Detect browser language and persist user preference
- Provide translation utilities to components

#### Internal Structure

- `i18next` with `react-i18next` integration
- Language detection via `i18next-browser-languagedetector`
- Translation files in `src/i18n/locales/{lang}/common.json`
- `useTranslation` hook in components

---

## Architectural Layers and Dependencies

### Layer Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│  Layer 1: Presentation (React Components)                │
│  Dependencies: Layer 2 (via hooks), MUI, React Router    │
└────────────────────────┬─────────────────────────────────┘
                         │ useSelector, useDispatch
                         │ Custom Hooks
┌────────────────────────▼─────────────────────────────────┐
│  Layer 2: State Management (Redux Store, Slices)         │
│  Dependencies: Layer 3 (via extraArgument)               │
└────────────────────────┬─────────────────────────────────┘
                         │ Thunks, RTK Query
                         │ extraArgument.api
┌────────────────────────▼─────────────────────────────────┐
│  Layer 3: Service (API Manager, API Client, Auth)        │
│  Dependencies: Layer 4 (Axios, @cosmotech/api-ts)        │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/REST
                         │ OAuth2/OIDC
┌────────────────────────▼─────────────────────────────────┐
│  Layer 4: External Services (APIs, Auth Providers)       │
│  No internal dependencies                                │
└──────────────────────────────────────────────────────────┘
```

### Dependency Rules

1. **Upper layers depend on lower layers, never the reverse**

   - Components depend on Redux → ✅
   - Redux depends on API Manager → ✅
   - API Manager depends on Components → ❌

2. **Cross-layer access is abstracted**

   - Components access Redux via custom hooks (not raw `useDispatch`)
   - Redux accesses API via dependency injection (`extraArgument`)

3. **Layer separation enforcement**
   - Components cannot import from `src/services/api/` directly
   - API client accessed only through Redux middleware

### Circular Dependency Prevention

- **No circular imports** - enforced by ES module system
- **Dependency injection** - breaks direct coupling
- **Event-driven communication** - Redux actions as events

---

## Data Architecture

### Domain Model Structure

The application manages the following domain entities:

1. **User** (auth state)

   - Properties: `userId`, `userEmail`, `userName`, `profilePic`, `roles[]`, `permissions[]`
   - Source: Auth provider (Azure AD, Keycloak)

2. **Organization**

   - Properties: `id`, `name`, (additional fields from API)
   - Source: Cosmo Tech API `/organizations`

3. **Workspace**

   - Properties: `id`, `name`, (additional fields from API)
   - Source: Cosmo Tech API `/workspaces`

4. **Solution**

   - Properties: `id`, `name`, (additional fields from API)
   - Source: Cosmo Tech API `/solutions`

5. **Scenario** (Runner)
   - Properties: `id`, `name`, `ownerId`, (additional fields from API)
   - Source: Cosmo Tech API `/runners`

### State Shape

```javascript
{
  auth: {
    status: "AUTHENTICATED" | "ANONYMOUS" | "DENIED" | "UNKNOWN",
    userEmail: string,
    userId: string,
    userName: string,
    profilePic: string,
    roles: string[],
    permissions: string[],
    error: string
  },
  organizations: {
    list: Organization[],
    status: "IDLE" | "LOADING" | "ERROR"
  },
  workspaces: {
    list: Workspace[],
    status: "IDLE" | "LOADING" | "ERROR"
  },
  cosmoApi: {
    queries: { ... }, // RTK Query cache
    mutations: { ... }
  }
}
```

### Data Access Patterns

#### Pattern 1: Manual Thunks (Simple CRUD)

- Used for straightforward API calls without complex caching
- Example: `getAllOrganizations` thunk
- Status managed manually with `setOrganizationsListStatus`

#### Pattern 2: createAsyncThunk (Complex Async)

- Used for async operations with error handling and lifecycle hooks
- Example: `getAllWorkspaces` with `.pending`, `.fulfilled`, `.rejected` cases
- Automatic action dispatching

#### Pattern 3: RTK Query (Queries and Mutations)

- Used for operations requiring caching, invalidation, or optimistic updates
- Example: `getAllSolutions`, `renameScenario` mutation
- Automatic cache management and re-fetching

### Data Transformation

- **API → State**: Data stored as-is from API (no transformation layer yet)
- **State → Component**: Components access normalized state via selectors
- **Future consideration**: Add data mappers/DTOs if API shape diverges from UI needs

### Caching Strategy

- **RTK Query**: Automatic cache with configurable TTL (not currently customized)
- **Redux State**: Persists during session; cleared on page reload
- **LocalStorage**: Used for auth tokens and selected API provider

### Data Validation

- **API Level**: Axios interceptors for HTTP-level validation
- **State Level**: Redux reducers ensure state shape consistency
- **UI Level**: React Hook Form for form validation (imported but not yet extensively used)

---

## Cross-Cutting Concerns Implementation

### 1. Authentication & Authorization

#### Security Model

- OAuth2/OIDC with redirect-based flow
- JWT tokens stored in localStorage (via MSAL/Keycloak libraries)
- Bearer token authentication for API calls

#### Permission Enforcement

- **Route-level**: `UserStatusGate` component checks authentication status
- **API-level**: Axios interceptor injects Bearer token
- **State-level**: `AUTH_STATUS` enum tracks authentication state

#### Identity Management

- Auth provider selection at login (stored in localStorage)
- User profile fetched from auth provider
- Roles extracted from JWT token or userinfo endpoint

---

### 2. Error Handling & Resilience

#### Exception Handling Patterns

**Component-Level**:

- `ErrorBoundary` class component catches React errors
- Displays error details with stack trace
- Prevents entire app crash

**API-Level**:

- Try-catch in thunks with error state updates
- RTK Query returns `{ error }` object
- Console logging for debugging

**Auth-Level**:

- Specific handling for `BrowserAuthError` (MSAL config issues)
- Graceful fallback to ANONYMOUS state

#### Resilience Patterns

- **Token Refresh**: Proactive refresh 3 minutes before expiry
- **Loading States**: Prevent multiple simultaneous API calls
- **Error Recovery**: User can retry by triggering action again

---

### 3. Logging & Monitoring

#### Instrumentation Patterns

- `console.error()` for error logging
- `console.warn()` for configuration issues
- Redux DevTools integration for state debugging

#### Observability

- Redux DevTools Extension for time-travel debugging
- React DevTools for component inspection
- Network tab for API call inspection

---

### 4. Validation

#### Input Validation

- Material UI form components with validation props
- React Hook Form library available (not yet extensively used)
- Client-side validation before API calls

#### Business Rule Validation

- API returns validation errors (handled as error states)
- Future: Add explicit validation layer before API calls

---

### 5. Configuration Management

#### Configuration Sources

- **Build-time**: `vite.config.js`, `package.json`
- **Runtime**: `src/config/apis.json` (loaded dynamically)
- **Environment**: localStorage for user preferences

#### Environment-Specific Configuration

- Multiple API configurations in `apis.json`
- User selects environment at login
- No environment variables (yet) - all config in JSON

#### Secret Management

- Client IDs in `apis.json` (public identifiers, not secrets)
- Secrets (client secrets) not needed for public SPAs
- Access tokens stored in localStorage (managed by auth libraries)

---

## Service Communication Patterns

### Service Boundary Definitions

- **Frontend ↔ Cosmo Tech API**: RESTful HTTP/JSON
- **Frontend ↔ Auth Providers**: OAuth2/OIDC redirect flows

### Communication Protocols

- **HTTP/HTTPS**: All API communication
- **REST**: Standard REST verbs (GET, POST, PUT, PATCH, DELETE)
- **JSON**: Request and response format

### Synchronous vs. Asynchronous

- **All API calls are asynchronous** (Promises via Axios)
- No WebSocket or SSE (Server-Sent Events) - future consideration
- No background polling - user-initiated fetches only

### API Versioning

- API version in URL path (e.g., `/v3`, `/v3-1`, `/v4`)
- Version selected via API configuration
- No client-side version negotiation

### Service Discovery

- API base URLs configured in `apis.json`
- No dynamic service discovery
- Static configuration per environment

### Resilience Patterns in Service Communication

- **Retry Logic**: Not implemented (future consideration)
- **Circuit Breaker**: Not implemented
- **Timeout**: Browser default (configurable in Axios)
- **Token Refresh**: Implemented (see Authentication section)

---

## React-Specific Architectural Patterns

### 1. Component Composition and Reuse Strategies

#### Component Hierarchy

- **Presentational Components**: Pure UI components (e.g., `AppBar`, `NavigationMenu`)
- **Container Components**: Views that connect to Redux (e.g., `Organizations`, `Workspaces`)
- **Layout Components**: Wrappers with shared UI (e.g., `ResourcesLayout`)
- **Higher-Order Components**: Route guards (e.g., `UserStatusGate`)

#### Composition Patterns

- **Composition via Props**: `<ErrorBoundary>{children}</ErrorBoundary>`
- **Layout Pattern**: `<ResourcesLayout>` with `<Outlet>` for nested routes
- **Render Props**: Not extensively used (hooks preferred)

---

### 2. State Management Architecture

#### State Categories

1. **Server State**: Data from APIs (organizations, workspaces) - managed by Redux
2. **UI State**: Component-local state (form inputs, modals) - managed by `useState`
3. **URL State**: Route parameters and query strings - managed by React Router
4. **Derived State**: Computed from other state (e.g., `useIsAuthenticated`) - via `useMemo`

#### State Ownership

- **Global State**: Authentication, fetched resources → Redux
- **Local State**: Form inputs, UI toggles → `useState`
- **Shared State**: Lifted to nearest common ancestor or Redux

---

### 3. Side Effect Handling Patterns

#### useEffect Patterns

- **Data Fetching on Mount**: `useEffect(() => { fetchData(); }, [fetchData])`
- **Authentication Check**: `App.jsx` checks auth on mount
- **Language Detection**: `i18n` initializes on import

#### Async Operations

- **Redux Thunks**: Primary pattern for async logic
- **RTK Query**: For caching and optimistic updates
- **useEffect + Promises**: Minimal use (Redux preferred)

---

### 4. Routing and Navigation Approach

#### Routing Strategy

- **Declarative Routes**: `createRoutesFromElements` with JSX
- **Data Router**: React Router 7 pattern (future-ready for loaders/actions)
- **Nested Routes**: `Outlet` pattern for layouts
- **Route Guards**: `UserStatusGate` component

#### Navigation Patterns

- **Programmatic Navigation**: `<Navigate>` component for redirects
- **Declarative Navigation**: `<Link>` component for user-initiated
- **Navigation State**: `useLocation` for conditional logic

---

### 5. Data Fetching and Caching Patterns

#### Fetching Strategies

1. **Imperative Fetch**: `useEffect` + action dispatch on mount
2. **RTK Query Hooks**: `useGetAllSolutionsQuery()` with automatic fetching
3. **User-Initiated**: Button click → action dispatch

#### Caching

- **RTK Query Cache**: Automatic, configurable TTL
- **Redux State Cache**: Lasts for session
- **No Persistent Cache**: State cleared on page reload

---

### 6. Rendering Optimization Strategies

#### Performance Patterns

- **Memoization**: `useMemo` for computed values, `useCallback` for functions
- **Code Splitting**: Not yet implemented (future: React.lazy + Suspense)
- **Conditional Rendering**: Early returns for loading/error states
- **Key Props**: Proper keys in lists (`key={item.id}`)

#### Anti-Patterns Avoided

- ❌ Inline function definitions in render (useCallback used)
- ❌ Unnecessary re-renders (selectors are granular)
- ❌ Large component trees (composition keeps components small)

---

## Implementation Patterns

### 1. Interface Design Patterns

#### Custom Hook Interfaces

```javascript
// Action hooks return dispatch functions
export const useGetAllOrganizations = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(getAllOrganizations()), [dispatch]);
};

// Selector hooks return state slices
export const useOrganizationsList = () => {
  return useSelector((state) => state.organizations.list);
};

// Derived state hooks use useMemo
export const useIsAuthenticated = () => {
  const authStatus = useAuthStatus();
  return useMemo(() => {
    return authStatus === AUTH_STATUS.AUTHENTICATED || authStatus === AUTH_STATUS.DISCONNECTING;
  }, [authStatus]);
};
```

---

### 2. Service Implementation Patterns

#### Singleton Pattern (API Manager)

```javascript
class ApiManager {
  #api = null;  // Private field
  #apiClient = null;

  constructor() {
    this.#initAuthProvidersFromApis();
    this.#selectApiFromLocalStorage();
  }

  selectApi = (apiName, api) => {
    this.#api = api;
    this.#apiClient = getApiClient(this.#api.COSMOTECH_API_PATH);
  };

  getApiClient = () => this.#apiClient;
}

export const apiManager = new ApiManager();
Object.freeze(apiManager);  // Immutable singleton
```

---

### 3. Thunk Implementation Patterns

#### Manual Thunk (Simple)

```javascript
function getAllOrganizations() {
  return async (dispatch, getState, extraArgument) => {
    dispatch(setOrganizationsListStatus({ status: 'LOADING' }));
    const { api } = extraArgument;
    const { data } = await api.Organizations.findAllOrganizations();
    dispatch(setOrganizations({ organizations: data }));
  };
}
```

#### createAsyncThunk (Complex)

```javascript
export const getAllWorkspaces = createAsyncThunk('workspaces/getAll', async (arg, thunkAPI) => {
  const { api } = thunkAPI.extra;
  const { data } = await api.Workspaces.findAllWorkspaces('o-vloxvdke5gqvx');
  return data;
});

// Handled in slice's extraReducers
extraReducers: (builder) => {
  builder
    .addCase(getAllWorkspaces.pending, (state) => {
      state.status = 'LOADING';
    })
    .addCase(getAllWorkspaces.fulfilled, (state, action) => {
      state.list = action.payload;
      state.status = 'IDLE';
    })
    .addCase(getAllWorkspaces.rejected, (state) => {
      state.status = 'ERROR';
    });
};
```

---

### 4. RTK Query Implementation Patterns

#### Query Definition

```javascript
getAllSolutions: builder.query({
  queryFn: async (args, thunkAPI) => {
    const { api } = thunkAPI.extra;
    try {
      const { data } = await api.Solutions.findAllSolutions('o-vloxvdke5gqvx');
      return { data };
    } catch (error) {
      console.error(error);
      return { error };
    }
  },
}),
```

#### Mutation with Optimistic Update

```javascript
renameScenario: builder.mutation({
  queryFn: async (args, thunkAPI) => {
    const { api } = thunkAPI.extra;
    const { runnerId, patch } = args;
    const { data } = await api.Runners.updateRunner('o-vloxvdke5gqvx', 'w-314qryelkyop5', runnerId, patch);
    return { data };
  },
  async onQueryStarted(args, { dispatch, queryFulfilled }) {
    const { data } = await queryFulfilled;
    dispatch(
      cosmoApi.util.updateQueryData('getAllScenarios', undefined, (draft) => {
        const index = draft.findIndex((scenario) => scenario.id === data.id);
        draft[index] = data;
      })
    );
  },
}),
```

---

### 5. Component Implementation Patterns

#### View Component (Data Fetching)

```javascript
export const Organizations = () => {
  const getAllOrganizations = useGetAllOrganizations();
  const organizations = useOrganizationsList();
  const organizationsStatus = useOrganizationsListStatus();

  useEffect(() => {
    getAllOrganizations();
  }, [getAllOrganizations]);

  if (organizationsStatus === 'LOADING') return <h1>Loading...</h1>;

  return (
    <div>
      {organizations && (
        <ol>
          {organizations.map((org) => (
            <li key={org.id}>{org.name}</li>
          ))}
        </ol>
      )}
    </div>
  );
};
```

#### Route Guard Pattern

```javascript
export const UserStatusGate = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated && location.pathname !== '/sign-in') return <Navigate to="/sign-in" replace />;

  if (isAuthenticated && location.pathname === '/sign-in') return <Navigate to="/" replace />;

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
};
```

---

## Testing Architecture

### Testing Strategies

Currently, the project does not have an extensive test suite. Future testing architecture should follow these patterns:

#### Unit Testing

- **Target**: Redux reducers, utility functions, custom hooks
- **Tools**: Vitest (already compatible with Vite), React Testing Library
- **Pattern**: Test pure functions in isolation

#### Integration Testing

- **Target**: Component + Redux integration, API client + interceptors
- **Tools**: React Testing Library, MSW (Mock Service Worker)
- **Pattern**: Test user workflows (click → action → state → UI update)

#### E2E Testing

- **Target**: Full user flows (login → navigate → fetch data)
- **Tools**: Cypress (already configured in devDependencies)
- **Pattern**: Test critical paths in real browser

### Test Boundaries

| Layer             | Test Type   | Focus                                |
| ----------------- | ----------- | ------------------------------------ |
| Components        | Integration | User interactions, state integration |
| Redux Slices      | Unit        | Reducer logic, action creators       |
| Thunks            | Integration | API calls with mocked API client     |
| API Client        | Integration | Interceptors, token refresh logic    |
| Utility Functions | Unit        | Pure function logic                  |

### Test Data Strategies

- **Mock Data**: Hand-crafted fixtures for predictable tests
- **Factory Functions**: Generate test data programmatically
- **MSW**: Mock API responses for integration tests

---

## Deployment Architecture

### Build Process

#### Development

```bash
yarn start  # Vite dev server on port 3000
```

- Hot Module Replacement (HMR) with React Fast Refresh
- Source maps for debugging
- No bundling (native ES modules)

#### Production

```bash
yarn build  # Generates dist/ folder
```

- Tree-shaking and minification
- Code splitting (automatic by Vite)
- Asset optimization (images, fonts)
- Output: Static files ready for CDN/hosting

### Deployment Topology

#### Single-Page Application (SPA)

- **Build Output**: `dist/` folder with `index.html` + JS/CSS chunks
- **Hosting**: Static file hosting (S3, Netlify, Vercel, etc.)
- **Server Requirements**: None (client-side only)

#### CDN Deployment

- Static assets served from CDN
- HTML served from origin or CDN with short TTL
- Immutable assets with cache-busting hashes

### Environment-Specific Adaptations

- **Multi-Environment Support**: Single build works for all environments
- **Runtime Configuration**: API selection at login (user chooses environment)
- **No Build-Time Environment Variables**: Configuration loaded from `apis.json`

### Configuration Management Across Environments

- **Single Build Artifact**: Same `dist/` folder deployed everywhere
- **Runtime API Selection**: User selects from `apis.json` at login
- **Future Enhancement**: Load `apis.json` from server (not bundled)

### Containerization

Currently not containerized, but Docker setup would be straightforward:

```dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Extension and Evolution Patterns

### 1. Feature Addition Patterns

#### Adding a New Resource Type (e.g., "Users")

**Step 1: Create Redux Slice**

```javascript
// src/state/users/reducers.js
import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], status: 'IDLE' },
  reducers: {
    setUsers: (state, action) => {
      state.list = action.payload.users;
      state.status = 'IDLE';
    },
    setUsersStatus: (state, action) => {
      state.status = action.payload.status;
    },
  },
});

export const { setUsers, setUsersStatus } = usersSlice.actions;
export default usersSlice.reducer;
```

**Step 2: Create Thunk**

```javascript
// src/state/users/thunks/getAllUsers.js
import { setUsers, setUsersStatus } from '../reducers.js';

function getAllUsers() {
  return async (dispatch, getState, extraArgument) => {
    dispatch(setUsersStatus({ status: 'LOADING' }));
    const { api } = extraArgument;
    const { data } = await api.Users.findAllUsers(); // Assuming API method exists
    dispatch(setUsers({ users: data }));
  };
}

export default getAllUsers;
```

**Step 3: Create Custom Hooks**

```javascript
// src/state/users/hooks.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getAllUsers from './thunks/getAllUsers.js';

export const useGetAllUsers = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(getAllUsers()), [dispatch]);
};

export const useUsersList = () => {
  return useSelector((state) => state.users.list);
};

export const useUsersListStatus = () => {
  return useSelector((state) => state.users.status);
};
```

**Step 4: Register Reducer in rootReducer**

```javascript
// src/state/rootReducer.js
import usersReducer from './users/reducers.js';

const rootReducer = combineReducers({
  auth: authReducer,
  organizations: organizationsReducer,
  workspaces: workspacesReducer,
  users: usersReducer, // Add this line
  [cosmoApi.reducerPath]: cosmoApi.reducer,
});
```

**Step 5: Create View Component**

```javascript
// src/views/Users.jsx
import React, { useEffect } from 'react';
import { useGetAllUsers, useUsersList, useUsersListStatus } from '../state/users/hooks.js';

export const Users = () => {
  const getAllUsers = useGetAllUsers();
  const users = useUsersList();
  const usersStatus = useUsersListStatus();

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  if (usersStatus === 'LOADING') return <h1>Loading...</h1>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

**Step 6: Add Route**

```javascript
// src/AppRoutes.jsx
<Route path="users" element={<Users />} />
```

---

### 2. Adding New API Methods

If the API client needs a new method not in `@cosmotech/api-ts`:

**Option 1: Extend API Client**

```javascript
// src/services/api/apiClient.js
export const getApiClient = (apiUrl) => ({
  apiUrl,
  Solutions: SolutionApiFactory(null, apiUrl, axiosClientApi),
  // ... existing factories
  Users: UserApiFactory(null, apiUrl, axiosClientApi), // Add new factory
});
```

**Option 2: Custom API Call in Thunk**

```javascript
// For one-off API calls not in SDK
function customApiCall() {
  return async (dispatch, getState, extraArgument) => {
    const { api } = extraArgument;
    const response = await axios.get(`${api.apiUrl}/custom-endpoint`);
    // Process response...
  };
}
```

---

### 3. Adding New Authentication Provider

**Step 1: Create Provider Configuration**

```javascript
// src/services/auth/okta.js (example)
import { Auth, AuthOkta } from '@cosmotech/core';

const getConfig = (apiConfig) => {
  return {
    loginRequest: { scopes: ['openid', 'profile'] },
    accessRequest: { scopes: [apiConfig.OKTA_API_SCOPE] },
    msalConfig: {
      auth: {
        clientId: apiConfig.OKTA_CLIENT_ID,
        redirectUri: `${window.location.origin}/sign-in`,
        authority: apiConfig.OKTA_ISSUER,
      },
    },
  };
};

export const addAuthProvider = (name, apiConfig) => {
  const OKTA_CONFIG = getConfig(apiConfig);
  Auth.addProvider({ ...AuthOkta, name }).setConfig(OKTA_CONFIG);
};
```

**Step 2: Update detectApiAuthProviderType**

```javascript
// src/services/api/apiUtils.js
export const detectApiAuthProviderType = (api) => {
  if (api == null) return;
  if (api.AUTH_KEYCLOAK_CLIENT_ID && api.AUTH_KEYCLOAK_REALM) return 'keycloak';
  if (api.APP_REGISTRATION_CLIENT_ID && api.AZURE_TENANT_ID) return 'azure';
  if (api.OKTA_CLIENT_ID && api.OKTA_ISSUER) return 'okta'; // Add this
};
```

**Step 3: Update ApiManager**

```javascript
// src/services/api/apiManager.js
import { addAuthProvider as addOktaAuthProvider } from '../auth/okta';

#initAuthProvidersFromApis = () => {
  const apis = this.#apiConfig.getApis();
  Object.entries(apis).forEach(([apiName, api]) => {
    const authProviderType = detectApiAuthProviderType(api);
    if (authProviderType === 'azure') addAzureAuthProvider(apiName, api);
    else if (authProviderType === 'keycloak') addKeycloakAuthProvider(apiName, api);
    else if (authProviderType === 'okta') addOktaAuthProvider(apiName, api);  // Add this
    else {
      console.warn(`Unknown auth provider type for api "${apiName}"`);
    }
  });
};
```

---

### 4. Modification Patterns

#### Changing Existing Component

- Maintain backward compatibility in props
- Use optional chaining (`?.`) for new props
- Add feature flags if breaking change is significant

#### Deprecation Pattern

```javascript
// Mark deprecated in JSDoc
/**
 * @deprecated Use NewComponent instead. Will be removed in v2.0.0
 */
export const OldComponent = ({ children }) => {
  console.warn('OldComponent is deprecated. Use NewComponent instead.');
  return <NewComponent>{children}</NewComponent>;
};
```

---

### 5. Integration Patterns

#### Integrating External Service (Example: Analytics)

**Step 1: Create Service Module**

```javascript
// src/services/analytics/analyticsManager.js
class AnalyticsManager {
  #initialized = false;

  init = (apiKey) => {
    if (this.#initialized) return;
    // Initialize analytics library
    window.analytics.init(apiKey);
    this.#initialized = true;
  };

  trackEvent = (eventName, properties) => {
    if (!this.#initialized) return;
    window.analytics.track(eventName, properties);
  };
}

export const analyticsManager = new AnalyticsManager();
```

**Step 2: Initialize in App.jsx**

```javascript
// src/App.jsx
useEffect(() => {
  analyticsManager.init(ANALYTICS_API_KEY);
}, []);
```

**Step 3: Use in Components**

```javascript
// src/views/Organizations.jsx
const handleOrgClick = (org) => {
  analyticsManager.trackEvent('organization_clicked', { orgId: org.id });
  // ... rest of logic
};
```

---

## Architectural Pattern Examples

### 1. Layer Separation Examples

#### Interface Definition and Implementation Separation

**Interface (Custom Hook)**:

```javascript
// src/state/organizations/hooks.js
export const useGetAllOrganizations = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(getAllOrganizations()), [dispatch]);
};
```

**Implementation (Thunk)**:

```javascript
// src/state/organizations/thunks/getAllOrganizations.js
function getAllOrganizations() {
  return async (dispatch, getState, extraArgument) => {
    dispatch(setOrganizationsListStatus({ status: 'LOADING' }));
    const { api } = extraArgument;
    const { data } = await api.Organizations.findAllOrganizations();
    dispatch(setOrganizations({ organizations: data }));
  };
}
```

**Usage (Component)**:

```javascript
// src/views/Organizations.jsx
const getAllOrganizations = useGetAllOrganizations();
useEffect(() => {
  getAllOrganizations(); // Clean interface, no Redux knowledge needed
}, [getAllOrganizations]);
```

---

### 2. Cross-Layer Communication Examples

#### Component → Redux → API

```javascript
// Component dispatches action
const handleRefresh = () => {
  getAllOrganizations(); // Custom hook
};

// ↓ Flows to Redux thunk
function getAllOrganizations() {
  return async (dispatch, getState, extraArgument) => {
    const { api } = extraArgument; // Dependency injection
    const { data } = await api.Organizations.findAllOrganizations();
    dispatch(setOrganizations({ organizations: data }));
  };
}

// ↓ API client makes HTTP call
export const getApiClient = (apiUrl) => ({
  Organizations: OrganizationApiFactory(null, apiUrl, axiosClientApi),
});

// ↓ Axios interceptor adds auth
axiosInstance.interceptors.request.use(async (request) => {
  const authHeaders = await getAuthenticationHeaders();
  request.headers = { ...request.headers, ...authHeaders };
  return request;
});
```

---

### 3. Extension Point Examples

#### Plugin Registration Pattern (Auth Providers)

```javascript
// Dynamic provider registration
Auth.addProvider({ ...AuthMSAL, name: 'azure-prod' }).setConfig(azureConfig);
Auth.addProvider({ ...AuthKeycloakRedirect, name: 'keycloak-dev' }).setConfig(keycloakConfig);

// Runtime provider selection
Auth.setProvider('azure-prod');
await Auth.signIn();
```

#### Configuration-Driven Extension (API Selection)

```javascript
// APIs configured in JSON
{
  "phoenixdev": {
    "APP_REGISTRATION_CLIENT_ID": "...",
    "AZURE_TENANT_ID": "...",
    "COSMOTECH_API_PATH": "https://dev.api.cosmotech.com/phoenix/v3-1"
  },
  "production": {
    "APP_REGISTRATION_CLIENT_ID": "...",
    "AZURE_TENANT_ID": "...",
    "COSMOTECH_API_PATH": "https://api.cosmotech.com/prod/v3-1"
  }
}

// User selects at runtime
apiManager.selectApi('phoenixdev', apis['phoenixdev']);
```

---

## Architectural Decision Records

### ADR 1: Redux Toolkit over Context API

**Context**: Need centralized state management for authentication, resource lists, and API state.

**Decision**: Use Redux Toolkit with feature-based slices.

**Rationale**:

- Redux DevTools for debugging and time-travel
- Mature ecosystem with middleware support
- RTK simplifies boilerplate (compared to classic Redux)
- Better performance for large state trees (selector memoization)
- Middleware enables dependency injection (API client)

**Consequences**:

- ✅ Predictable state updates, excellent debugging
- ✅ Easy to test (pure reducer functions)
- ❌ Slightly more boilerplate than Context API
- ❌ Learning curve for new developers

**Alternatives Considered**:

- Context API + useReducer (too limited for complex async)
- Zustand (less mature, no DevTools integration)

---

### ADR 2: Manual Thunks + RTK Query (Hybrid Approach)

**Context**: Need both simple API calls and complex caching/mutations.

**Decision**: Use manual thunks for simple CRUD, RTK Query for caching/mutations.

**Rationale**:

- Manual thunks are simpler for straightforward fetch operations
- RTK Query provides automatic caching, invalidation, optimistic updates
- Gradual migration path (start simple, add RTK Query as needed)

**Consequences**:

- ✅ Flexibility to choose right tool for each use case
- ✅ Avoid over-engineering simple cases
- ❌ Two patterns to maintain (inconsistency)
- ❌ Developers must know when to use which

**Future Direction**: Migrate more endpoints to RTK Query as complexity grows.

---

### ADR 3: Multi-Provider Authentication with Runtime Selection

**Context**: Support multiple environments (dev, staging, prod) with different auth providers.

**Decision**: Singleton Auth abstraction (`@cosmotech/core`) with dynamic provider registration.

**Rationale**:

- Single build artifact for all environments
- User selects environment at login (no redeploy needed)
- Auth abstraction hides provider-specific details
- Easy to add new providers (Okta, Auth0, etc.)

**Consequences**:

- ✅ Extremely flexible deployment model
- ✅ Easy to test against multiple environments
- ✅ Future-proof for new auth providers
- ❌ Slightly more complex initial setup
- ❌ API configuration stored in client (security consideration)

**Security Note**: Client IDs are public; no secrets exposed in SPA.

---

### ADR 4: Feature-Based Folder Structure

**Context**: How to organize code as the application grows.

**Decision**: Organize by feature (auth, organizations, workspaces), not by technical layer.

**Rationale**:

- Related code stays together (reducers, thunks, hooks for same feature)
- Easier to find and modify feature-specific code
- Scales better than layer-based structure
- Encourages feature cohesion

**Consequences**:

- ✅ Easy to locate feature-specific code
- ✅ Clear ownership boundaries
- ✅ Simpler code navigation
- ❌ Shared utilities need separate folder
- ❌ Cross-feature dependencies can become complex

---

### ADR 5: Material UI for Component Library

**Context**: Need consistent, accessible UI components.

**Decision**: Use Material UI 6 with `sx` prop styling.

**Rationale**:

- Comprehensive component library (reduces custom component dev)
- Built-in theming system
- Excellent accessibility (ARIA support)
- Active community and documentation
- `sx` prop enables style co-location without CSS files

**Consequences**:

- ✅ Rapid UI development
- ✅ Consistent design language
- ✅ Accessibility built-in
- ❌ Large bundle size (mitigated by tree-shaking)
- ❌ Customization can be complex for non-standard designs

---

### ADR 6: Vite over Create React App

**Context**: Need fast development build tool.

**Decision**: Use Vite as build tool and dev server.

**Rationale**:

- Significantly faster cold starts (no bundling in dev)
- Native ES modules in dev (instant HMR)
- Modern build defaults (ES2015+, tree-shaking)
- Better developer experience
- CRA is deprecated

**Consequences**:

- ✅ Blazing fast development experience
- ✅ Modern by default
- ✅ Simpler configuration
- ❌ Ecosystem less mature than Webpack (but improving rapidly)
- ❌ Some older libraries may have compatibility issues

---

## Architecture Governance

### Maintaining Architectural Consistency

#### Code Review Checklist

- [ ] Components don't directly import from `src/services/`
- [ ] Redux logic uses custom hooks, not raw `useDispatch`
- [ ] New API calls go through thunks or RTK Query
- [ ] License headers present in all files
- [ ] Imports are sorted (via Prettier plugin)
- [ ] MUI components used (no custom CSS where avoidable)

#### Automated Checks

**ESLint**:

- Enforces React best practices (`eslint-plugin-react`)
- Hook dependencies lint (`eslint-plugin-react-hooks`)
- Prettier integration (`eslint-plugin-prettier`)

**Prettier**:

- Import sorting (`@trivago/prettier-plugin-sort-imports`)
- Consistent code formatting

**Future Consideration**:

- Architecture tests (e.g., ensure components don't import services)
- Bundle size monitoring
- Dependency cruiser for dependency graph validation

---

### Architectural Documentation Practices

- **Mandatory License Headers**: All files must include SPDX headers
- **JSDoc for Complex Functions**: Especially thunks and utilities
- **README.md**: High-level overview (currently exists)
- **This Blueprint**: Detailed architecture reference

---

## Blueprint for New Development

### Development Workflow

#### 1. Starting Points for Different Feature Types

| Feature Type                         | Starting Point                                            |
| ------------------------------------ | --------------------------------------------------------- |
| New Resource Type (e.g., "Datasets") | Create Redux slice → Thunks → Hooks → View → Route        |
| New UI Component                     | Create in `src/components/` → Export from `index.js`      |
| New API Endpoint                     | Extend API client → Create thunk or RTK Query endpoint    |
| New Auth Provider                    | Create config in `src/services/auth/` → Update ApiManager |
| New Route                            | Add to `AppRoutes.jsx` → Create view component            |

---

#### 2. Component Creation Sequence

**For a New Resource View**:

1. **Define State**: Create Redux slice in `src/state/{feature}/reducers.js`
2. **Create Thunk**: Add async action in `src/state/{feature}/thunks/{action}.js`
3. **Create Hooks**: Add custom hooks in `src/state/{feature}/hooks.js`
4. **Register Reducer**: Add to `src/state/rootReducer.js`
5. **Create View**: Add component in `src/views/{Feature}.jsx`
6. **Add Route**: Register in `src/AppRoutes.jsx`
7. **Add Navigation**: Update `NavigationMenu` if needed

---

### Implementation Templates

#### Redux Slice Template

```javascript
// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { createSlice } from '@reduxjs/toolkit';

const {featureName}Slice = createSlice({
  name: '{featureName}',
  initialState: { list: [], status: 'IDLE' },
  reducers: {
    set{FeatureName}: (state, action) => {
      state.list = action.payload.items;
      state.status = 'IDLE';
    },
    set{FeatureName}Status: (state, action) => {
      state.status = action.payload.status;
    },
  },
});

export const { set{FeatureName}, set{FeatureName}Status } = {featureName}Slice.actions;
export default {featureName}Slice.reducer;
```

---

#### Thunk Template

```javascript
// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { set{FeatureName}, set{FeatureName}Status } from '../reducers.js';

function getAll{FeatureName}() {
  return async (dispatch, getState, extraArgument) => {
    dispatch(set{FeatureName}Status({ status: 'LOADING' }));
    const { api } = extraArgument;
    try {
      const { data } = await api.{FeatureName}.findAll{FeatureName}();
      dispatch(set{FeatureName}({ items: data }));
    } catch (error) {
      console.error(error);
      dispatch(set{FeatureName}Status({ status: 'ERROR' }));
    }
  };
}

export default getAll{FeatureName};
```

---

#### Custom Hooks Template

```javascript
// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getAll{FeatureName} from './thunks/getAll{FeatureName}.js';

export const useGetAll{FeatureName} = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(getAll{FeatureName}()), [dispatch]);
};

export const use{FeatureName}List = () => {
  return useSelector((state) => state.{featureName}.list);
};

export const use{FeatureName}ListStatus = () => {
  return useSelector((state) => state.{featureName}.status);
};
```

---

#### View Component Template

```javascript
// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useEffect } from 'react';
import { Container, Typography, CircularProgress, List, ListItem } from '@mui/material';
import { useGetAll{FeatureName}, use{FeatureName}List, use{FeatureName}ListStatus } from '../state/{featureName}/hooks.js';

export const {FeatureName} = () => {
  const getAll{FeatureName} = useGetAll{FeatureName}();
  const items = use{FeatureName}List();
  const status = use{FeatureName}ListStatus();

  useEffect(() => {
    getAll{FeatureName}();
  }, [getAll{FeatureName}]);

  if (status === 'LOADING') {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {FeatureName}
      </Typography>
      <List>
        {items.map((item) => (
          <ListItem key={item.id}>{item.name}</ListItem>
        ))}
      </List>
    </Container>
  );
};
```

---

### Common Pitfalls

#### ❌ Architecture Violations to Avoid

1. **Direct API Calls from Components**

   ```javascript
   // ❌ BAD
   const handleClick = async () => {
     const response = await axios.get('/api/organizations');
     setOrganizations(response.data);
   };

   // ✅ GOOD
   const handleClick = () => {
     getAllOrganizations();  // Custom hook that dispatches thunk
   };
   ```

2. **Importing Services Directly**

   ```javascript
   // ❌ BAD
   import { apiManager } from 'src/services/api/apiManager';

   // ✅ GOOD - Access API only through Redux
   const { api } = extraArgument; // In thunks
   ```

3. **Not Using Custom Hooks**

   ```javascript
   // ❌ BAD
   const dispatch = useDispatch();
   const orgs = useSelector(state => state.organizations.list);
   const handleLoad = () => dispatch(getAllOrganizations());

   // ✅ GOOD
   const orgs = useOrganizationsList();
   const getAllOrganizations = useGetAllOrganizations();
   const handleLoad = () => getAllOrganizations();
   ```

4. **Missing License Headers**

   ```javascript
   // ❌ BAD - Missing header

   // ✅ GOOD
   // SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
   // SPDX-License-Identifier: LicenseRef-CosmoTech
   ```

5. **Mutating State Directly**

   ```javascript
   // ❌ BAD (but Immer prevents this in Redux Toolkit)
   state.list.push(newItem);

   // ✅ GOOD (Immer makes this safe)
   state.list = [...state.list, newItem];
   ```

---

### Performance Considerations

- **Memoize Selectors**: Use `useMemo` for derived state
- **Memoize Callbacks**: Use `useCallback` for event handlers passed to child components
- **Avoid Inline Functions**: Don't define functions inside JSX (breaks memoization)
- **Lazy Load Routes**: Consider React.lazy() for code splitting (future enhancement)

---

### Testing Blind Spots

Areas currently lacking test coverage (future improvement areas):

- Redux thunks (API integration tests)
- Component integration with Redux
- Authentication flows (E2E tests)
- Error handling paths
- Token refresh logic

---

## Document Maintenance

### Blueprint Currency

**Generated:** January 29, 2026  
**Based on Version:** 0.1.0-dev  
**Review Frequency:** Quarterly or after major architectural changes

### Keeping Blueprint Updated

**Triggers for Update**:

- New architectural patterns introduced
- Major refactoring (e.g., migration to RTK Query)
- New cross-cutting concerns (analytics, error tracking)
- Technology stack changes (React 20, Redux v3, etc.)

**Update Process**:

1. Identify architectural changes in recent PRs
2. Update relevant sections of this document
3. Add/update architectural decision records
4. Update code examples if patterns changed
5. Increment document version number

---

## Conclusion

The Cosmo Tech Administration Portal follows a **feature-based layered architecture** with Redux Toolkit at its core, emphasizing separation of concerns, unidirectional data flow, and extensibility. Key architectural strengths include:

- **Multi-provider authentication** with runtime selection
- **Dependency injection** for testability and flexibility
- **Feature-based organization** for maintainability
- **Hybrid state management** (thunks + RTK Query) for appropriate tooling
- **Single build artifact** for all environments

### Architectural Maturity

The current architecture is solid for a 0.1.0-dev release, with clear patterns and room for growth. Future enhancements should focus on:

1. **Testing**: Add comprehensive test suite
2. **Caching**: Optimize with RTK Query caching strategies
3. **Code Splitting**: Implement lazy loading for routes
4. **Error Boundaries**: Expand error handling with reporting service
5. **Performance**: Add React.memo, route-based code splitting

This blueprint serves as the authoritative reference for architectural decisions and patterns. Developers should consult this document when implementing new features to ensure consistency with established patterns.

---

**End of Architecture Blueprint**
