// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech

/**
 * Normalize a value to a lowercase string. Returns '' for null/undefined.
 */
export const normalizeSearchValue = (value) => (value == null ? '' : String(value)).toLowerCase();

/**
 * Case-insensitive multi-field search matcher.
 * Returns true if the query is empty or any of the provided values contain the query.
 */
export const matchesSearchQuery = (query, ...values) => {
  const normalizedQuery = normalizeSearchValue(query).trim();
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
};
