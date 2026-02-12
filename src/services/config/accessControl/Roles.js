// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

/**
 * Application-level roles (from JWT claims / app registration).
 * These map to roles assigned in the identity provider (Azure AD app roles, Keycloak roles).
 */
export const APP_ROLES = {
  OrganizationAdmin: 'Organization.Admin',
  OrganizationCollaborator: 'Organization.Collaborator',
  OrganizationModeler: 'Organization.Modeler',
  OrganizationUser: 'Organization.User',
  OrganizationViewer: 'Organization.Viewer',
  PlatformAdmin: 'Platform.Admin',
};

/**
 * Resource-level ACL roles as declared by the back-end.
 * The full list of roles per component is fetched dynamically via listPermissions / getAllPermissions.
 */
export const ACL_ROLES = {
  ORGANIZATION: { NONE: 'none', VIEWER: 'viewer', USER: 'user', EDITOR: 'editor', ADMIN: 'admin' },
  WORKSPACE: { NONE: 'none', VIEWER: 'viewer', USER: 'user', EDITOR: 'editor', ADMIN: 'admin' },
  RUNNER: { NONE: 'none', VIEWER: 'viewer', EDITOR: 'editor', VALIDATOR: 'validator', ADMIN: 'admin' },
  DATASET: { NONE: 'none', VIEWER: 'viewer', EDITOR: 'editor', ADMIN: 'admin' },
};
