import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { resolve } from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    vanillaExtractPlugin(),
  ],
  server: {
    proxy: {
      '/api': {
        // Docker環境では server:8000、ローカルでは localhost:8000 を使用
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        // Docker環境では server:8000、ローカルでは localhost:8000 を使用
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
