// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  // When built for a sub-path deployment (e.g. /admin-portal), set VITE_PUBLIC_URL
  // at build time so Vite emits the correct base in index.html asset references.
  base: process.env.VITE_PUBLIC_URL || '/',
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
