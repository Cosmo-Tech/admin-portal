<!-- SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech -->
<!-- SPDX-License-Identifier: LicenseRef-CosmoTech -->

# Auth Provider Switching — Design & Implementation

## 1. Problem Statement

The Admin Portal supports multiple API environments (e.g. *warp sphinx*, *wa-vela-dev*), each backed by a different Keycloak realm (or Azure tenant). Two critical bugs existed:

| Bug | Symptom | Root Cause |
|-----|---------|------------|
| **Wrong Keycloak URL** | User selects "warp sphinx" but is redirected to the "wa-vela-dev" Keycloak realm | `@cosmotech/core` uses a shared singleton `msalApp`; the last registered provider overwrites it |
| **`interaction_in_progress`** | After pressing **Back** mid-login or on any redirect error, every subsequent login attempt fails permanently | MSAL stores an interaction flag in `sessionStorage`; it is never cleared if the flow is interrupted |
| **PKCE mismatch** | `ServerError: invalid_grant: PKCE verification failed: Code mismatch` after returning from Keycloak | Clearing interaction state also destroys the PKCE `code_verifier` stored in `sessionStorage`, which MSAL needs to exchange the authorization code |

### 1.1 Wrong Keycloak URL — Detailed Cause

```
┌─ App Startup ──────────────────────────────────────────────────────┐
│  apiManager.#initAuthProvidersFromApis()                           │
│    ├─ addKeycloakAuthProvider("warp sphinx", ...)                   │
│    │   └─ Auth.addProvider(...).setConfig(sphinxConfig)             │
│    │       └─ msalApp = new PublicClientApplication(sphinxMsal)     │
│    │                                                                │
│    └─ addKeycloakAuthProvider("wa-vela-dev", ...)                   │
│        └─ Auth.addProvider(...).setConfig(velaConfig)               │
│            └─ msalApp = new PublicClientApplication(velaMsal)  ◄──  │
│               OVERWRITES the singleton!                            │
└────────────────────────────────────────────────────────────────────┘

┌─ User clicks Login with "warp sphinx" ────────────────────────────┐
│  Auth.setProvider("warp sphinx")                                   │
│    └─ currentProvider = providers["warp sphinx"]   ✓ correct       │
│  Auth.signIn()                                                     │
│    └─ currentProvider.signIn()                                     │
│        └─ msalApp.handleRedirectPromise()                          │
│            └─ uses velaMsal config   ✗ WRONG REALM                 │
└────────────────────────────────────────────────────────────────────┘
```

The `@cosmotech/core` `AuthKeycloakRedirect` module has module-scoped variables (`msalApp`, `config`). Each call to `setConfig()` overwrites them. `Auth.setProvider()` only switches the `currentProvider` pointer — it does **not** re-initialize `msalApp`.

### 1.2 `interaction_in_progress` — Detailed Cause

```
1. User clicks Login → signIn() → msalApp.loginRedirect()
2. MSAL writes interaction flag to sessionStorage:
     sessionStorage["msal.<clientId>.interaction.status"] = "interaction_in_progress"
3. Browser redirects to Keycloak login page
4. User presses Back → returns to the app
5. The interaction flag is still in sessionStorage (never cleared)
6. User clicks Login again → msalApp.handleRedirectPromise()
     → sees stale flag → throws BrowserAuthError: interaction_in_progress
7. The error is caught → auth status becomes DENIED → user is permanently blocked
```

Additionally, `@cosmotech/core` writes its own flag in `localStorage`:
```
localStorage["authInteractionInProgress"] = providerName
```

### 1.3 PKCE Mismatch — Detailed Cause

```
1. User selects API → clicks Login
2. signIn() stores PKCE code_verifier in sessionStorage
3. msalApp.loginRedirect() → browser goes to Keycloak
4. User authenticates → Keycloak redirects back with authorization code in URL
5. App reloads → Redux state lost → Login page shown
6. User clicks Login again → login thunk runs
7. clearMsalInteractionState() wipes sessionStorage keys containing "interaction"
   (this also removes the MSAL interaction status that gates handleRedirectPromise)
8. signIn() → handleRedirectPromise() sees NO interaction in progress → returns null
9. handleResponse(null) → calls loginRedirect() AGAIN with a NEW code_verifier
10. On the next return, the old authorization code doesn't match the new code_verifier
    → ServerError: invalid_grant: PKCE verification failed: Code mismatch
```

This is especially visible when the API requires a VPN: the redirect to Keycloak works
(Keycloak is reachable) but the token exchange or API calls may fail with 502, and
subsequent retries hit the PKCE mismatch because the interaction state was destroyed.

---

## 2. Design

### 2.1 Design Principles

| Principle | Decision |
|-----------|----------|
| **Targeted cleanup** | Only remove MSAL interaction-tracking keys, not all browser storage |
| **Redirect-aware cleanup** | Only clear interaction state when NOT returning from a redirect (preserve PKCE `code_verifier`) |
| **Reactive fallback** | On error (`interaction_in_progress`, `invalid_grant`), clear stale state so next attempt works |
| **No core lib fork** | Work around the singleton issue from application code |
| **Recoverable errors** | Auth errors → `AUTH_STATUS.ANONYMOUS` (retry), not `DENIED` (blocked) |

### 2.2 Solution Overview

```
┌─ Login Thunk ──────────────────────────────────────────────────────┐
│                                                                     │
│  1. apiManager.resetAuthProvider(provider)      ◄── FIX #1         │
│     └─ Re-creates msalApp with the correct realm config            │
│                                                                     │
│  2. Auth.setProvider(provider)                                      │
│     └─ Switches currentProvider pointer                             │
│                                                                     │
│  3. if (!isReturningFromRedirect())             ◄── FIX #3         │
│       clearMsalInteractionState()                                   │
│       └─ Removes stale interaction flags ONLY when there is         │
│          NO OIDC response in the URL (preserves PKCE verifier)     │
│                                                                     │
│  4. Auth.signIn()                                                   │
│     └─ msalApp now points to the correct realm  ✓                  │
│     └─ If returning from redirect, handleRedirectPromise()          │
│        exchanges the auth code using the preserved code_verifier   │
│                                                                     │
│  5. catch(error)                                                    │
│     └─ if "interaction_in_progress":            ◄── FIX #2         │
│        clearMsalInteractionState() + ANONYMOUS                      │
│     └─ if "invalid_grant" / PKCE:               ◄── FIX #3b        │
│        clearMsalInteractionState() + ANONYMOUS                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Why Not Clear All Storage?

| Approach | Pros | Cons |
|----------|------|------|
| `Application > Clear Storage` (manual) | 100% clean | Destroys cached tokens, user prefs, selected API, theme |
| Clear all MSAL keys (`msal.*`) | Thorough | May break SSO for other tabs/providers |
| **Clear only interaction keys** (chosen) | Minimal side-effects, preserves valid sessions | Slightly more complex regex matching |

The interaction flag is the **only** thing that causes the deadlock. Cached tokens and account data should be preserved — they enable silent token renewal and SSO.

---

## 3. Implementation

### 3.1 Files Changed

| File | Change |
|------|--------|
| `src/services/auth/keycloak.js` | `resetAuthProviderConfig` now **returns** the `setConfig()` promise so it can be `await`ed |
| `src/services/auth/azure.js` | Same — return `setConfig()` promise |
| `src/services/api/apiManager.js` | New `resetAuthProvider(apiName)` method that re-initializes the MSAL instance |
| `src/state/auth/thunks/login.js` | Proactive cleanup + reactive error handling for `interaction_in_progress` |

### 3.2 `resetAuthProviderConfig` (keycloak.js / azure.js)

The `resetAuthProviderConfig` functions now **return** the promise from `setConfig()`:

```javascript
// src/services/auth/keycloak.js
export const resetAuthProviderConfig = (name, apiConfig) => {
  Auth.setProvider(name);
  const MSAL_KEYCLOAK_CONFIG = getConfig(apiConfig);
  return Auth.addProvider({ ...AuthKeycloakRedirect, name }).setConfig(MSAL_KEYCLOAK_CONFIG);
};
```

This is critical because `setConfig()` calls `new PublicClientApplication(config)` and then `await msalApp.initialize()`. Without awaiting, the `msalApp` may not be ready when `signIn()` is called.

### 3.3 `apiManager.resetAuthProvider()`

```javascript
// src/services/api/apiManager.js
resetAuthProvider = async (apiName) => {
  const apis = this.#apiConfig.getApis();
  const api = apis[apiName];
  if (!api) return;
  const authProviderType = detectApiAuthProviderType(api);
  if (authProviderType === 'azure') await resetAzureAuthProviderConfig(apiName, api);
  else if (authProviderType === 'keycloak') await resetKeycloakAuthProviderConfig(apiName, api);
};
```

This ensures the shared **`msalApp` singleton** inside `@cosmotech/core` is re-created with the correct configuration for the selected API, regardless of which provider was registered last during app startup.

### 3.4 `clearMsalInteractionState()`

```javascript
// src/state/auth/thunks/login.js
const clearMsalInteractionState = () => {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.includes('interaction')) keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  localStorage.removeItem('authInteractionInProgress');
};
```

**What it clears:**
- `sessionStorage["msal.<clientId>.interaction.status"]` — MSAL's built-in interaction tracker
- Any other sessionStorage keys containing "interaction" (future-proof)
- `localStorage["authInteractionInProgress"]` — `@cosmotech/core`'s custom tracker

**What it preserves:**
- PKCE `code_verifier` and request cache (stored under `msal.<clientId>.request.*`)
- Cached tokens (`authAccessToken`, `authIdToken`)
- Account data (`authAccountId`, `authEmail`)
- Auth status (`authAuthenticated`)
- Selected provider (`authProvider`)
- All other app state (theme, language, etc.)

### 3.5 `isReturningFromRedirect()`

```javascript
// src/state/auth/thunks/login.js
const isReturningFromRedirect = () => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  if (hashParams.has('code') || hashParams.has('state') || hashParams.has('error')) return true;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('code') || searchParams.has('state') || searchParams.has('error')) return true;
  return false;
};
```

OIDC redirect responses place `code` + `state` (success) or `error` + `state` (failure)
in the URL. When these are present, `handleRedirectPromise()` needs the full interaction
state in sessionStorage — including the PKCE `code_verifier` — to complete the token
exchange. Clearing it prematurely causes `PKCE verification failed: Code mismatch`.

**Decision matrix:**

| URL has OIDC params? | Action | Reason |
|---------------------|--------|--------|
| No (fresh login) | `clearMsalInteractionState()` | Remove stale flags from a previous aborted flow |
| Yes (redirect return) | Skip clearing | Preserve PKCE state for `handleRedirectPromise()` |

### 3.6 Login Thunk — Updated Flow

```javascript
// src/state/auth/thunks/login.js
export const login = createAsyncThunk('auth/login', async (arg, thunkAPI) => {
  const { provider } = arg;
  const { dispatch } = thunkAPI;
  try {
    if (provider) {
      await apiManager.resetAuthProvider(provider);  // Fix #1: correct MSAL instance
      Auth.setProvider(provider);

      if (!isReturningFromRedirect()) {              // Fix #3: guard PKCE state
        clearMsalInteractionState();                 // Fix #2: prevent interaction_in_progress
      }

      await Auth.signIn();
      // ... authentication logic ...
    }
  } catch (error) {
    if (error?.errorCode === 'interaction_in_progress') {
      clearMsalInteractionState();                   // Fallback: clear on error
      dispatch(setAuthData({
        error: 'A previous login was still in progress. Please try logging in again.',
        status: AUTH_STATUS.ANONYMOUS,               // Not DENIED — user can retry
        // ...
      }));
      return;
    }
    if (error?.errorCode === 'invalid_grant' || error?.message?.includes('PKCE')) {
      clearMsalInteractionState();                   // Clean up broken PKCE state
      dispatch(setAuthData({
        error: 'Login failed — the authorization code could not be exchanged. ' +
               'This can happen if the server was unreachable (e.g. VPN required). Please try again.',
        status: AUTH_STATUS.ANONYMOUS,
        // ...
      }));
      return;
    }
    // ... other error handling ...
  }
});
```

---

## 4. Sequence Diagram

```
User         Login.jsx         login thunk         apiManager         @cosmotech/core       Keycloak
  │               │                 │                    │                    │                  │
  │ select API    │                 │                    │                    │                  │
  ├──────────────►│                 │                    │                    │                  │
  │               │ selectApi()     │                    │                    │                  │
  │               ├────────────────►├─── resetAuth ─────►│                    │                  │
  │               │                 │    Provider()      │ resetAuthProvider  │                  │
  │               │                 │                    │    Config()        │                  │
  │               │                 │                    ├───────────────────►│                  │
  │               │                 │                    │                    │ new MSAL +        │
  │               │                 │                    │◄───────────────────│ initialize()     │
  │               │                 │                    │                    │                  │
  │               │                 │ clearMsalInteractionState()            │                  │
  │               │                 │ ─────────── clears sessionStorage ───► │                  │
  │               │                 │                    │                    │                  │
  │               │                 │ Auth.setProvider() │                    │                  │
  │               │                 ├────────────────────┼───────────────────►│                  │
  │               │                 │                    │                    │                  │
  │               │                 │ Auth.signIn()      │                    │                  │
  │               │                 ├────────────────────┼───────────────────►│                  │
  │               │                 │                    │                    │ loginRedirect()  │
  │               │                 │                    │                    ├─────────────────►│
  │               │                 │                    │                    │                  │
  │◄──────────────┼─────────────────┼────────────────────┼────────────────────┼──── redirect ───┤
  │               │                 │                    │                    │   (correct URL)  │
```

---

## 5. Testing Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| **Normal switch** | Select "warp sphinx" → Login → Logout → Select "wa-vela-dev" → Login | Redirected to correct Keycloak realm each time |
| **Back button** | Select API → Login → Press Back on Keycloak page → Select API → Login | Login succeeds without `interaction_in_progress` error |
| **Rapid switch** | Select "warp sphinx" → quickly switch to "wa-vela-dev" → Login | Redirected to wa-vela-dev realm (not sphinx) |
| **Error recovery** | Trigger `interaction_in_progress` somehow → Retry Login | Succeeds on retry; no manual storage clearing needed |
| **VPN / 502** | Select VPN-only API without VPN → 502 / PKCE error → Connect VPN → Retry | Auth state reset to ANONYMOUS, retry succeeds |
| **PKCE redirect** | Select API → Login → Authenticate on Keycloak → Return to app → Login | PKCE code exchange succeeds; no "Code mismatch" error |
| **Tab persistence** | Login in Tab A → Open Tab B → should be authenticated via SSO | Cached tokens preserved; SSO works |

---

## 6. Known Limitations

1. **`@cosmotech/core` singleton pattern**: The root cause is the module-scoped `msalApp` variable in `AuthKeycloakRedirect`. The `resetAuthProvider` workaround re-creates it on every login — ideally the core lib should support per-provider MSAL instances.

2. **`addProvider` console warning**: When re-adding an existing provider during `resetAuthProviderConfig`, the core lib logs `Provider "X" already exists`. This is cosmetic and does not affect functionality (tracked by existing `FIXME` comment).

3. **Session storage scan**: `clearMsalInteractionState()` scans all sessionStorage keys looking for "interaction". This is safe but could be more precise if MSAL exposes a public API for clearing interaction state in a future version.
