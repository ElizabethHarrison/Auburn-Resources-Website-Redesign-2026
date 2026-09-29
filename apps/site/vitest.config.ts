import { defineConfig } from 'vitest/config';

// Unit tests cover pure TypeScript in src/lib. Astro components are tested end-to-end (Playwright +
// axe) from Phase 3 onwards, in /tests.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
