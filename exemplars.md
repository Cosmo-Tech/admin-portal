# Code Exemplars Blueprint

## Introduction

This document identifies high-quality, representative code examples from the Cosmo Tech Administration Portal codebase. These exemplars demonstrate our coding standards, architectural patterns, and best practices. They serve as reference implementations for developers working on new features or refactoring existing code.

The project is built with **React 19**, **Material UI 6**, **Redux Toolkit** (RTK), and **Vite**, following a well-structured architecture that separates concerns between state management, API integration, authentication, and UI components.

---

## Table of Contents

1. [State Management Patterns](#state-management-patterns)
   - [Redux Slices](#redux-slices)
   - [Redux Thunks](#redux-thunks)
   - [RTK Query](#rtk-query)
   - [Custom Hooks](#custom-hooks)
2. [API Integration & Services](#api-integration--services)
   - [API Client Configuration](#api-client-configuration)
   - [API Manager](#api-manager)
   - [Authentication Interceptors](#authentication-interceptors)
3. [Authentication & Authorization](#authentication--authorization)
   - [Auth Provider Configuration](#auth-provider-configuration)
   - [Auth Hooks](#auth-hooks)
4. [Component Architecture](#component-architecture)
   - [Functional Components](#functional-components)
   - [Route Guards](#route-guards)
   - [Error Boundaries](#error-boundaries)
5. [Application Structure](#application-structure)
   - [App Entry Point](#app-entry-point)
   - [Store Configuration](#store-configuration)
   - [Routing](#routing)
6. [Coding Conventions](#coding-conventions)

---

## State Management Patterns

### Redux Slices

#### **Exemplar: [src/state/organizations/reducers.js](src/state/organizations/reducers.js)**

**Why it's exemplary:**
- Clean, minimal slice definition using Redux Toolkit's `createSlice`
- Clear initial state structure with semantic property names
- Simple, focused reducer actions that follow single responsibility principle
- Exports both actions and reducer for easy consumption
- Proper state immutability through Immer (built into RTK)

**Key implementation details:**
```javascript
const organizationsSlice = createSlice({
  name: 'organizations',
  initialState: organizationsInitialState,
  reducers: {
    setOrganizations: (state, action) => {
      const { organizations } = action.payload;
      state.list = organizations;
      state.status = 'IDLE';
    },
    setOrganizationsListStatus: (state, action) => {
      const { status } = action.payload;
      state.status = status;
    },
  },
});
```

**Pattern demonstrated:**
- Feature-based state organization
- Status flags for async operations (`IDLE`, `LOADING`)
- Destructured payload for clarity
- Named exports for actions

---

### Redux Thunks

#### **Exemplar: [src/state/organizations/thunks/getAllOrganizations.js](src/state/organizations/thunks/getAllOrganizations.js)**

**Why it's exemplary:**
- Concise async action implementation
- Proper use of `extraArgument` to access API client (dependency injection)
- Updates loading state before API call
- Clean dispatch pattern
- Error handling is implicit (handled by middleware/try-catch at call site)

**Key implementation details:**
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

**Pattern demonstrated:**
- Manual thunk (not createAsyncThunk) for simple cases
- Status management pattern
- Separation of API call from action dispatch
- File-per-thunk organization

---

#### **Exemplar: [src/state/auth/thunks/login.js](src/state/auth/thunks/login.js)**

**Why it's exemplary:**
- Uses `createAsyncThunk` for more complex async logic
- Comprehensive error handling with fallback messages
- Updates multiple auth state properties atomically
- Integrates with `@cosmotech/core` Auth singleton
- Clear separation between success and error paths

**Key implementation details:**
```javascript
export const login = createAsyncThunk('auth/login', async (arg, thunkAPI) => {
  const { provider } = arg;
  const { dispatch } = thunkAPI;
  try {
    if (provider) {
      Auth.setProvider(provider);
      await Auth.signIn();
      const isAuthenticated = await Auth.isUserSignedIn();
      dispatch(
        setAuthData({
          error: '',
          userEmail: isAuthenticated ? Auth.getUserEmail() : '',
          // ... more fields
          status: isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS,
        })
      );
    }
  } catch (error) {
    console.error(error);
    dispatch(
      setAuthData({
        error: error?.errorMessage ?? UNKNOWN_ERROR_MESSAGE,
        // ... clear all user data on error
        status: AUTH_STATUS.DENIED,
      })
    );
  }
});
```

**Pattern demonstrated:**
- `createAsyncThunk` for complex async workflows
- Explicit error handling with user-friendly messages
- Conditional data population based on authentication status
- Integration with external auth library

---

### RTK Query

#### **Exemplar: [src/state/api/apiSlice.js](src/state/api/apiSlice.js)**

**Why it's exemplary:**
- Uses `fakeBaseQuery` to wrap custom API client (not Axios directly)
- Defines both queries and mutations
- Implements optimistic updates with `onQueryStarted`
- Manual cache updates after mutations
- Exports auto-generated hooks for components
- Proper error handling in queryFn

**Key implementation details:**
```javascript
export const cosmoApi = createApi({
  reducerPath: 'cosmoApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
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
    renameScenario: builder.mutation({
      queryFn: async (args, thunkAPI) => {
        const { api } = thunkAPI.extra;
        const { runnerId, patch } = args;
        try {
          const { data } = await api.Runners.updateRunner('o-vloxvdke5gqvx', 'w-314qryelkyop5', runnerId, patch);
          return { data };
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            cosmoApi.util.updateQueryData('getAllScenarios', undefined, (draft) => {
              const index = draft.findIndex((scenario) => scenario.id === data.id);
              draft[index] = data;
            })
          );
        } catch (error) {
          console.error(error);
          return { error };
        }
      },
    }),
  }),
});
```

**Pattern demonstrated:**
- RTK Query with custom API client
- Query and mutation definitions
- Optimistic UI updates with cache manipulation
- Auto-generated hooks: `useGetAllSolutionsQuery`, `useRenameScenarioMutation`
- Access to injected API client via `thunkAPI.extra`

---

### Custom Hooks

#### **Exemplar: [src/state/organizations/hooks.js](src/state/organizations/hooks.js)**

**Why it's exemplary:**
- Encapsulates Redux logic away from components
- Uses `useCallback` to prevent unnecessary re-renders
- Provides clear, semantic API for component consumers
- Separate hooks for different concerns (actions vs. selectors)
- Follows naming convention: `use[Feature][Action/Selector]`

**Key implementation details:**
```javascript
export const useGetAllOrganizations = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(getAllOrganizations()), [dispatch]);
};

export const useOrganizationsList = () => {
  return useSelector((state) => state.organizations.list);
};

export const useOrganizationsListStatus = () => {
  return useSelector((state) => state.organizations.status);
};
```

**Pattern demonstrated:**
- Action hooks wrapped in `useCallback`
- Selector hooks for state access
- Feature-specific hook organization
- Clean separation between dispatch and select operations

---

#### **Exemplar: [src/state/auth/hooks.js](src/state/auth/hooks.js)**

**Why it's exemplary:**
- Includes derived state with `useMemo` for computed values
- Demonstrates parameterized action hooks
- Shows different patterns: simple selectors, computed selectors, and action dispatchers
- Exports semantic hook names that describe business logic

**Key implementation details:**
```javascript
export const useLogin = () => {
  const dispatch = useDispatch();
  return useCallback((provider) => dispatch(login({ provider })), [dispatch]);
};

export const useIsAuthenticated = () => {
  const authStatus = useAuthStatus();
  return useMemo(() => {
    return authStatus === AUTH_STATUS.AUTHENTICATED || authStatus === AUTH_STATUS.DISCONNECTING;
  }, [authStatus]);
};
```

**Pattern demonstrated:**
- Parameterized action hooks
- Computed/derived state with `useMemo`
- Business logic encapsulation (authentication check)
- Performance optimization through memoization

---

## API Integration & Services

### API Client Configuration

#### **Exemplar: [src/services/api/apiClient.js](src/services/api/apiClient.js)**

**Why it's exemplary:**
- Centralizes Axios configuration with interceptors
- Automatic token refresh logic (checks expiry within 3 minutes)
- JWT token decoding for token management
- Clean factory pattern for creating API factory instances
- Automatic authentication header injection
- Integrates with `@cosmotech/core` Auth singleton

**Key implementation details:**
```javascript
export const getAuthenticationHeaders = async (allowApiKey = false) => {
  let tokens = await Auth.acquireTokens();
  if (tokens?.accessToken) {
    const accessData = jwtDecode(tokens.accessToken);
    const expiryDate = accessData.exp;
    const remainingTimeInMinutes = Math.floor((expiryDate - Date.now() / 1000) / 60);
    if (remainingTimeInMinutes <= 3) {
      tokens = await Auth.refreshTokens();
    }
    if (tokens?.accessToken) return { Authorization: 'Bearer ' + tokens.accessToken };
    Auth.signOut();
  }
};

const addInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    async (request) => {
      const authenticationHeaders = await getAuthenticationHeaders(true);
      request.headers = {
        ...request.headers,
        ...authenticationHeaders,
      };
      return request;
    },
    (error) => {
      console.error(error);
    }
  );
  return axiosInstance;
};

export const getApiClient = (apiUrl) => ({
  apiUrl,
  Solutions: SolutionApiFactory(null, apiUrl, axiosClientApi),
  Datasets: DatasetApiFactory(null, apiUrl, axiosClientApi),
  Runners: RunnerApiFactory(null, apiUrl, axiosClientApi),
  // ... more API factories
});
```

**Pattern demonstrated:**
- Request interceptor pattern
- Proactive token refresh (before expiry)
- JWT token inspection
- Factory pattern for API clients
- Separation of concerns (auth logic separate from API logic)

---

### API Manager

#### **Exemplar: [src/services/api/apiManager.js](src/services/api/apiManager.js)**

**Why it's exemplary:**
- Singleton pattern with private fields (using `#` syntax)
- Multi-provider authentication support (Azure MSAL, Keycloak)
- Dynamic API configuration from JSON
- Persistence with localStorage
- Auto-initialization from stored preferences
- Clean separation between configuration and runtime state

**Key implementation details:**
```javascript
class ApiManager {
  #api = null;
  #apiClient = null;
  #apiConfig = null;

  constructor() {
    this.#api = null;
    this.#apiConfig = apiConfig;
    this.#initAuthProvidersFromApis();
    this.#selectApiFromLocalStorage();
  }

  #initAuthProvidersFromApis = () => {
    const apis = this.#apiConfig.getApis();
    Object.entries(apis).forEach(([apiName, api]) => {
      const authProviderType = detectApiAuthProviderType(api);
      if (authProviderType === 'azure') addAzureAuthProvider(apiName, api);
      else if (authProviderType === 'keycloak') addKeycloakAuthProvider(apiName, api);
      else {
        console.warn(`Unknown auth provider type for api "${apiName}"`);
      }
    });
  };

  selectApi = (apiName, api) => {
    this.#api = api;
    this.#apiClient = getApiClient(this.#api.COSMOTECH_API_PATH);
  };

  getApiClient = () => this.#apiClient;
}

export const apiManager = new ApiManager();
Object.freeze(apiManager);
```

**Pattern demonstrated:**
- Singleton with private fields
- Dynamic provider registration
- Type detection and conditional logic
- Lazy initialization
- Immutable export with `Object.freeze`

---

### Authentication Interceptors

#### **Exemplar: [src/services/auth/azure.js](src/services/auth/azure.js)**

**Why it's exemplary:**
- Dynamically configures MSAL based on API configuration
- Environment-aware redirect URIs
- Proper tenant and scope configuration
- Demonstrates integration with `@cosmotech/azure` and `@cosmotech/core`
- Supports dynamic provider addition and reconfiguration

**Key implementation details:**
```javascript
const getConfig = (apiConfig) => {
  const APP_REGISTRATION_CLIENT_ID = apiConfig.APP_REGISTRATION_CLIENT_ID;
  const AZURE_TENANT_ID = apiConfig.AZURE_TENANT_ID;
  const COSMOTECH_API_SCOPE = apiConfig.COSMOTECH_API_SCOPE;
  const PUBLIC_URL = apiConfig.PUBLIC_URL ?? '';

  return {
    loginRequest: { scopes: ['user.read'] },
    accessRequest: { scopes: [COSMOTECH_API_SCOPE] },
    msalConfig: {
      auth: {
        clientId: APP_REGISTRATION_CLIENT_ID,
        redirectUri: `${window.location.protocol}//${window.location.host}${PUBLIC_URL}/sign-in`,
        authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
        knownAuthorities: [`https://login.microsoftonline.com/${AZURE_TENANT_ID}`],
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    },
  };
};

export const addAuthProvider = (name, apiConfig) => {
  const MSAL_AZURE_CONFIG = getConfig(apiConfig);
  Auth.addProvider({ ...AuthMSAL, name }).setConfig(MSAL_AZURE_CONFIG);
};
```

**Pattern demonstrated:**
- Configuration factory pattern
- Dynamic provider registration
- Environment-aware configuration
- Proper OAuth2/OIDC scope management
- Integration with external auth libraries

---

## Authentication & Authorization

### Auth Provider Configuration

Refer to the [Azure exemplar](#exemplar-srcservicesauthazurejs) above for auth provider configuration patterns.

### Auth Hooks

Refer to the [Auth Hooks exemplar](#exemplar-srcstateauthhooksjs) in the Custom Hooks section.

---

## Component Architecture

### Functional Components

#### **Exemplar: [src/components/AppBar/AppBar.jsx](src/components/AppBar/AppBar.jsx)**

**Why it's exemplary:**
- Clean functional component with hooks
- Uses Material UI components and theme system
- `sx` prop for styling (co-locating styles with components)
- Proper semantic HTML structure
- Composition pattern (includes `LanguageSwitcher`)

**Key implementation details:**
```javascript
export const AppBar = () => {
  const theme = useTheme();
  return (
    <MuiAppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.background.default,
        color: '#000',
      }}
    >
      <Toolbar style={{ padding: 0 }}>
        <Box
          component="img"
          sx={{ height: '39px', width: '100px', maxHeight: '39px', maxWidth: '100px', margin: '0 16px' }}
          alt="Cosmo Tech"
          src="/cosmotech_logo_light_theme.png"
        />
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Typography variant="h6" sx={{ textTransform: 'uppercase', color: '#000' }}>
            user & permission management
          </Typography>
        </Box>
        <LanguageSwitcher />
      </Toolbar>
    </MuiAppBar>
  );
};
```

**Pattern demonstrated:**
- Functional component with hooks
- MUI theme integration with `useTheme`
- `sx` prop for inline styling
- Component composition
- Named exports

---

#### **Exemplar: [src/views/Organizations.jsx](src/views/Organizations.jsx)**

**Why it's exemplary:**
- Demonstrates data fetching pattern with hooks
- Uses custom Redux hooks for clean component logic
- `useEffect` for data loading on mount
- Conditional rendering based on loading state
- Clean separation of concerns (UI vs. data logic)

**Key implementation details:**
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
      {organizations && organizationsStatus !== 'LOADING' && (
        <ol>
          {organizations.map((organizations) => (
            <li key={organizations.id}>{organizations.name}</li>
          ))}
        </ol>
      )}
    </div>
  );
};
```

**Pattern demonstrated:**
- Data fetching on component mount
- Custom hooks for Redux integration
- Conditional rendering based on status
- List rendering with proper keys
- View component structure

---

### Route Guards

#### **Exemplar: [src/components/UserStatusGate/UserStatusGate.jsx](src/components/UserStatusGate/UserStatusGate.jsx)**

**Why it's exemplary:**
- Implements authentication guard pattern
- Uses React Router's `Navigate` for redirects
- Location-aware logic (prevents redirect loops)
- Wraps protected routes with `ErrorBoundary`
- Clean conditional logic for authentication states

**Key implementation details:**
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

**Pattern demonstrated:**
- Route guard/gate component
- Authentication-based navigation
- Preventing redirect loops
- Error boundary integration
- React Router `Outlet` pattern

---

### Error Boundaries

#### **Exemplar: [src/components/ErrorBoundary/ErrorBoundary.jsx](src/components/ErrorBoundary/ErrorBoundary.jsx)**

**Why it's exemplary:**
- Class component implementing React error boundary lifecycle
- Catches JavaScript errors in child component tree
- Displays user-friendly error UI with details
- Logs errors to console (can be extended to error reporting service)
- Uses `getDerivedStateFromError` and `componentDidCatch`

**Key implementation details:**
```javascript
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ /* error UI styles */ }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Pattern demonstrated:**
- React error boundary pattern
- Class component for error handling
- Error state management
- User-friendly error display
- Extensibility for error reporting services

---

## Application Structure

### App Entry Point

#### **Exemplar: [src/App.jsx](src/App.jsx)**

**Why it's exemplary:**
- Clean app initialization with authentication check
- Uses `useEffect` for async initialization
- Proper error handling for MSAL errors
- Layout structure with MUI `Box` components
- Integrates routing, app bar, and main content area

**Key implementation details:**
```javascript
function App() {
  const setAuthData = useSetAuthData();
  useEffect(() => {
    async function checkLogin() {
      if (localStorage.getItem('authProvider')) {
        try {
          const isAuthenticated = await Auth.isUserSignedIn();
          setAuthData({
            error: '',
            userEmail: isAuthenticated ? Auth.getUserEmail() : '',
            userId: isAuthenticated ? Auth.getUserId() : '',
            userName: isAuthenticated ? Auth.getUserName() : '',
            profilePic: isAuthenticated ? Auth.getUserPicUrl() : '',
            roles: isAuthenticated ? Auth.getUserRoles() : [],
            permissions: [],
            status: isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS,
          });
        } catch (error) {
          if (error?.name === 'BrowserAuthError') {
            console.error(error);
          }
        }
      }
    }
    checkLogin();
  }, [setAuthData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppRoutes />
      </Box>
    </Box>
  );
}
```

**Pattern demonstrated:**
- App initialization pattern
- Authentication restoration from localStorage
- Async initialization in useEffect
- Layout composition with flexbox
- Error handling for specific error types

---

### Store Configuration

#### **Exemplar: [src/state/store.config.js](src/state/store.config.js)**

**Why it's exemplary:**
- Clean Redux Toolkit store configuration
- Custom middleware configuration with `extraArgument`
- RTK Query middleware integration
- Disables serializable check for flexibility
- Dependency injection pattern for API client

**Key implementation details:**
```javascript
const applicationStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { api: apiManager.getApiClient() ?? {} },
      },
      serializableCheck: {
        ignoreState: true,
        ignoreActions: true,
      },
    }).concat(cosmoApi.middleware),
});
export default applicationStore;
```

**Pattern demonstrated:**
- Redux Toolkit store configuration
- Dependency injection via `extraArgument`
- Middleware composition
- RTK Query integration
- Feature-based reducer composition

---

#### **Exemplar: [src/state/rootReducer.js](src/state/rootReducer.js)**

**Why it's exemplary:**
- Clean reducer composition using `combineReducers`
- Feature-based organization (auth, organizations, workspaces)
- RTK Query reducer integration
- Clear namespace separation

**Key implementation details:**
```javascript
const rootReducer = combineReducers({
  auth: authReducer,
  organizations: organizationsReducer,
  workspaces: workspacesReducer,
  [cosmoApi.reducerPath]: cosmoApi.reducer,
});
```

**Pattern demonstrated:**
- Reducer composition
- Feature-based state organization
- RTK Query reducer inclusion
- Clean, maintainable state structure

---

### Routing

#### **Exemplar: [src/AppRoutes.jsx](src/AppRoutes.jsx)**

**Why it's exemplary:**
- Uses React Router 7 with data router pattern
- Nested routes for layouts and protected routes
- Route guard integration with `UserStatusGate`
- Clean route definition with `createRoutesFromElements`
- Layout route pattern with `Outlet`

**Key implementation details:**
```javascript
const AppRoutes = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<UserStatusGate />}>
          <Route element={<ResourcesLayout />}>
            <Route index element={<Users />} />
            <Route path="solution" element={<Solutions />} />
            <Route path="workspace" element={<Workspaces />} />
            <Route path="organization" element={<Organizations />} />
            <Route path="scenario" element={<Scenarios />} />
          </Route>

          <Route path="sign-in" element={<Login />} />
        </Route>
      </>
    ),
    { basename: '' }
  );
  return <RouterProvider router={router} />;
};
```

**Pattern demonstrated:**
- Data router pattern (React Router 7)
- Nested route structure
- Layout routes with shared UI
- Route guard pattern
- Protected and public route separation

---

## Coding Conventions

### License Headers

**All files in this codebase MUST include the following license header:**

```javascript
// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
```

This is a mandatory convention across the entire codebase.

### Import Organization

- Imports are automatically sorted using `@trivago/prettier-plugin-sort-imports`
- Use the `src/` alias for absolute-like imports
- Group imports: external libraries, then internal modules

### Component Conventions

- Prefer functional components with hooks
- Use named exports for components
- Place one component per file
- Use MUI's `sx` prop for styling
- Follow naming convention: PascalCase for components, camelCase for functions/hooks

### State Management Conventions

- Feature-based organization: `state/{feature}/reducers.js`, `state/{feature}/hooks.js`, `state/{feature}/thunks/`
- One thunk per file in `thunks/` directory
- Export both actions and reducer from slice files
- Use `UPPERCASE` for status constants
- Hooks follow `use[Feature][Action/Selector]` naming pattern

### API Conventions

- Always access API through Redux (via `extraArgument.api` or `thunkAPI.extra.api`)
- Never call API directly from components
- Use interceptors for cross-cutting concerns (auth headers)
- Implement token refresh logic in interceptors

### File Organization

```
src/
├── components/       # Reusable UI components
├── views/           # Page-level components
├── state/           # Redux slices, thunks, hooks
│   ├── {feature}/   # Feature-based organization
│   │   ├── reducers.js
│   │   ├── hooks.js
│   │   └── thunks/
│   │       └── {action}.js
├── services/        # API clients, auth providers
├── config/          # Configuration files
├── i18n/            # Internationalization
└── themes/          # MUI theme configuration
```

---

## Conclusion

These exemplars represent the high-quality patterns and practices established in the Cosmo Tech Administration Portal. When implementing new features:

1. **State Management**: Follow the feature-based organization pattern with slices, thunks, and custom hooks
2. **API Integration**: Always use the injected API client through Redux, never direct API calls
3. **Components**: Build functional components with MUI, use hooks for logic, and keep components focused
4. **Authentication**: Leverage the Auth singleton and implement proper token management
5. **Error Handling**: Use error boundaries and provide user-friendly error messages
6. **Routing**: Use route guards and nested layouts for protected areas

By following these patterns, you'll maintain consistency, readability, and maintainability across the codebase. Always include the mandatory license header, organize imports properly, and structure features following the established conventions.

For questions or clarifications on these patterns, refer to the specific exemplar files listed above.
