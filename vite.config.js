// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  // Relative base ensures assets are loaded relative to the page URL.
  // This makes the build work at any URL prefix (e.g. /admin-portal/) without
  // knowing the prefix at build time, and without breaking the Ingress rewrite.
  base: './',
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      src: '/src',
    },
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
