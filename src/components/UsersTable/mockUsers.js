// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

const mockUsers = Array.from({ length: 50 }).map((_, i) => ({
  id: `principal-${i + 1}`,
  principalId: `principal-${i + 1}`,
  name: i % 7 === 0 ? `Group ${i + 1}` : `User ${i + 1}`,
  principalType: i % 7 === 0 ? 'Group' : 'User',
  platformRoles: i % 3 === 0 ? ['Platform.Admin'] : i % 3 === 1 ? ['Platform.User'] : ['Default Access'],
  assignedDate: new Date(Date.now() - i * 86400 * 1000).toISOString(),
  resourceDisplayName: 'Cosmo Tech Platform',
}));

export default mockUsers;
