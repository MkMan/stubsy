import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test-setup.ts',
    dir: './src',
    clearMocks: true,
    coverage: {
      clean: true,
      cleanOnRerun: true,
      reporter: ['text-summary', 'lcov'],
    },
  },
});
