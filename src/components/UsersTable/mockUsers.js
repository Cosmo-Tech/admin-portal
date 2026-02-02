// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

const mockUsers = Array.from({ length: 50 }).map((_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  platformRoles: i % 3 === 0 ? ['Admin'] : i % 3 === 1 ? ['Editor'] : ['Viewer'],
  organizations: i % 2 === 0 ? ['Org A', 'Org B'] : ['Org C'],
  lastLogin: new Date(Date.now() - i * 3600 * 1000),
  status: i % 5 === 0 ? 'Suspended' : 'Active',
}));

export default mockUsers;
