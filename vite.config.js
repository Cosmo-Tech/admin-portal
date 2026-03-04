// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  // Use relative base so Vite emits ./assets/… paths in index.html.
  // This makes the build work correctly under any sub-path deployment (e.g. /admin-portal)
  // without needing a build-time VITE_PUBLIC_URL environment variable.
  base: './',
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
