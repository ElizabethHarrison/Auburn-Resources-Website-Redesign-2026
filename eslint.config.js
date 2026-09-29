// ESLint flat config for the whole workspace.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default tseslint.config(
  {
    ignores: ['**/dist/', '**/dist-preview/', '**/.astro/', '**/node_modules/'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...astro.configs.recommended,
  // Static accessibility checks on Astro templates (axe runs on rendered pages from Phase 3).
  ...astro.configs['jsx-a11y-strict'],
  {
    rules: {
      // CLAUDE.md §4.5: no `any` without a comment explaining why.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Scrollable regions (wide tables) must be keyboard-focusable (axe: scrollable-region-focusable).
      'astro/jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
      // role="list" on styled lists is deliberate: Safari/VoiceOver drops list semantics when
      // list-style is none, and the explicit role restores them.
      'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
    },
  },
  {
    // Config files run in Node.
    files: ['**/*.config.{js,ts}', 'eslint.config.js'],
    languageOptions: {
      globals: { process: 'readonly' },
    },
  },
  {
    // Build scripts run in Node and report to the console.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
);
