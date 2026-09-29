import { defineConfig } from 'vitest/config';

// Unit tests cover pure TypeScript in src/lib. Astro components are tested end-to-end (Playwright +
// axe) from Phase 3 onwards, in /tests.
export default defineConfig({
  // Unit tests exercise the preview data (including indicative figures); rendering rules are tested
  // for both modes explicitly.
  define: { __PREVIEW_BUILD__: 'true' },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
