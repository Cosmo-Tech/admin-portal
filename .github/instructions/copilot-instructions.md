<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->
---
applyTo: '**'
---

# Cosmo Tech Admin Portal - Development Guide

React 19 + Redux Toolkit + Material-UI 6 + Vite portal for managing Cosmo Tech resources.

---

## Quick Start

```bash
yarn install && yarn start   # Use yarn only (not npm)
```

**File headers required:**
```javascript
// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
```

**Commits:** Conventional format enforced by git hook
```
feat|fix|refactor|perf|style|test|build|ops|docs|chore(scope): description
```

---

## Architecture

### State Management

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **RTK Query** (preferred) | Caching, optimistic updates | `useGetAllSolutionsQuery()` |
| **Redux Thunks** (legacy) | Simple CRUD, no caching | `getAllOrganizations()` |

API client injected via Redux `extraArgument.api`.

### Auth Flow
1. User selects API → `apiManager` configures auth provider (Azure MSAL or Keycloak)
2. Login thunk calls `Auth.signIn()` from `@cosmotech/core`
3. `UserStatusGate` protects routes based on `AUTH_STATUS`

### Project Structure
```
src/
├── views/           # Page components (Users, Organizations, etc.)
├── components/      # Reusable UI (AppBar, NavigationMenu, etc.)
├── state/           # Redux: {feature}/reducers.js, hooks.js, thunks/
├── services/api/    # apiManager (singleton), apiClient (Axios)
├── config/          # apis.json (multi-environment config)
└── i18n/            # Translations (en, fr)
```

---

## Coding Standards

### React Patterns
- **Functional components + hooks only**
- **Custom hooks** encapsulate Redux logic (`useOrganizationsList()`, `useGetAllOrganizations()`)
- **Composition over inheritance** via children, render props
- **Material-UI `sx` prop** for styling (no separate CSS files)

### State Slice Pattern
```javascript
// state/{feature}/hooks.js
export const useFeatureData = () => useSelector(state => state.feature.data);
export const useFetchFeature = () => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(fetchFeature()), [dispatch]);
};
```

### Imports
Use absolute paths via Vite alias:
```javascript
import { UserStatusGate } from 'src/components';
```

---

## Key Rules

| Rule | Details |
|------|---------|
| Package manager | `yarn` only (v4.5.3) |
| Components never call APIs | Dispatch via Redux hooks |
| New API features | Use RTK Query in `apiSlice.js` |
| Error handling | `ErrorBoundary` + try-catch in thunks |
| i18n | `useTranslation()` hook, files in `src/i18n/locales/` |
| Testing | React Testing Library + Jest |

---

## References
- [Architecture Blueprint](../../docs/architecture/Project_Architecture_Blueprint.md)
- [Conventional Commits](../../docs/coding-rules/conventional-commits.md)
- [Admin Portal Overview](../../docs/functional/00%203%20Admin%20Portal%20Overview.md)
