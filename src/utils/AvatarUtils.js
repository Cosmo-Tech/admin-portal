// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { normalizeSearchValue } from './SearchUtils.js';

/**
 * Produce a deterministic index from a string value.
 * Used to pick a stable color from an avatar palette.
 */
export const getStableNumber = (value, maxExclusive) => {
  if (maxExclusive <= 0) return 0;
  const normalized = normalizeSearchValue(value);
  if (!normalized) return 0;

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.codePointAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % maxExclusive;
};

/**
 * Pick a deterministic avatar color for a user name.
 */
export const getAvatarColor = (name, avatarColors, fallbackColor) => {
  const fallbackPalette = fallbackColor ? [fallbackColor] : [];
  const paletteColors = avatarColors?.length > 0 ? avatarColors : fallbackPalette;
  if (paletteColors.length === 0) return undefined;
  if (!name) return paletteColors[0];
  return paletteColors[getStableNumber(name, paletteColors.length)];
};

/**
 * Extract up to two initials from a display name.
 */
export const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};
