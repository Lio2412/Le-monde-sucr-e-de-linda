/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['frontend/src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**']
    },
    alias: {
      '@': resolve(__dirname, './frontend/src'),
      '@tests': resolve(__dirname, './tests')
    },
    deps: {
      inline: ['@chakra-ui/react', '@emotion/react', '@emotion/styled']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});
