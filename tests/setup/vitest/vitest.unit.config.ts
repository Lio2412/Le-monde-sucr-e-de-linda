import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**/*', 'tests/integration/**/*'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['frontend/src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/types/',
        '**/*.stories.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../../frontend/src'),
      'next/router': path.resolve(__dirname, '../../../tests/setup/vitest/mocks/next/router.ts'),
      'next/navigation': path.resolve(__dirname, '../../../tests/setup/vitest/mocks/next/navigation.ts'),
    },
  },
});
