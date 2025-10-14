/**
 * Vite Configuration
 *
 * Development server configuration for the Interactive Globe project.
 * Used by Playwright tests and local development.
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Root directory
  root: './',

  // Public directory for static assets
  publicDir: 'assets',

  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'examples/basic-example.html'),
        test: resolve(__dirname, 'examples/test-globe.html'),
      },
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'assets'),
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['three'],
  },
});
