// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

/**
 * Permission constants for each resource type, matching the back-end permission strings.
 */
export const ACL_PERMISSIONS = {
  ORGANIZATION: {
    READ: 'read',
    READ_SECURITY: 'read_security',
    CREATE_CHILDREN: 'create_children',
    WRITE: 'write',
    DELETE: 'delete',
    WRITE_SECURITY: 'write_security',
  },
  WORKSPACE: {
    READ: 'read',
    READ_SECURITY: 'read_security',
    CREATE_CHILDREN: 'create_children',
    WRITE: 'write',
    DELETE: 'delete',
    WRITE_SECURITY: 'write_security',
  },
  RUNNER: {
    READ: 'read',
    READ_SECURITY: 'read_security',
    LAUNCH: 'launch',
    WRITE: 'write',
    VALIDATE: 'validate',
    DELETE: 'delete',
    WRITE_SECURITY: 'write_security',
  },
  DATASET: {
    READ: 'read',
    READ_SECURITY: 'read_security',
    WRITE: 'write',
    DELETE: 'delete',
    WRITE_SECURITY: 'write_security',
  },
};
