// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { describe, expect, it } from 'vitest';

describe('Smoke test', () => {
  it('should pass a basic assertion', () => {
    expect(true).toBe(true);
  });

  it('should have the correct app name in package.json', async () => {
    const pkg = await import('../../package.json');
    expect(pkg.name).toBe('@cosmotech/admin-portal');
  });
});
