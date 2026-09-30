import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'staging',
  },
  // Generated types are the contract between this schema and the site's mapper (CI checks for drift).
  typegen: {
    path: './schemaTypes/**/*.ts',
    schema: './schema.json',
    generates: '../site/src/lib/content/sanity/sanity.types.ts',
  },
});
