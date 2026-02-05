<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->
# Login Flow Technical Design

## Overview

Design the login flow with tenant selection, dynamic TypeScript client instantiation (v3 or v5), tenant persistence in localStorage, and automatic redirect to the first organization's detail view.

## Steps

### 1. Add API Version Detection

**File:** `src/services/api/apiUtils.js`

Enhance `detectApiAuthProviderType` to also return API version by parsing the `COSMOTECH_API_PATH` URL (e.g., `/v3` → `'v3'`, `/v5` → `'v5'`). Add new function `detectApiVersion(api)`.

### 2. Refactor API Client for Dynamic Version

**File:** `src/services/api/apiClient.js`

Refactor `getApiClient` to accept a version parameter and dynamically import from either `@cosmotech/api-ts-v3` or `@cosmotech/api-ts-v5` based on detected version.

### 3. Persist Selected Tenant

**File:** `src/services/api/apiManager.js`

Update `apiManager` to persist selected tenant via `localStorage.setItem('selectedApi', apiName)` on selection, and restore it on app initialization in the constructor.

### 4. Extend Login Thunk

**File:** `src/state/auth/thunks/login.js`

After successful auth:
- Dispatch `getAllOrganizations()`
- Store `apiVersion` and first `organizationId` in Redux state
- Navigate to `/organization/{firstOrgId}` using React Router

### 5. Update Login View

**File:** `src/views/Login.jsx`

Show loading state during org fetch and handle the redirect after organizations are loaded.

### 6. Add Redux State Fields

**File:** `src/state/auth/reducers.js`

Add to auth slice:
- `selectedApiVersion: 'v3' | 'v5' | null`
- `selectedOrganizationId: string | null`

## Considerations

1. **Dynamic import strategy:** Use `await import('@cosmotech/api-ts-v5')` for lazy loading, or pre-import both and switch at runtime? Recommend dynamic import to reduce bundle size.

2. **Error case:** If organization list is empty after login, redirect to an error/empty state page rather than crashing.

3. **Session restore:** On page refresh, restore both tenant AND navigate back to last organization if `selectedOrganizationId` is persisted.
