// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useSelector } from 'react-redux';

export const useSolutionsList = () => {
  return useSelector((state) => state.solutions.list);
};

export const useSolutionsListStatus = () => {
  return useSelector((state) => state.solutions.status);
};
