import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from '../../../vitest.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['tests/e2e/**/*', 'tests/unit/**/*'],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup/vitest/setup.ts'],
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
  })
);
