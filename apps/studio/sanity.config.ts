/**
 * Sanity Studio configuration (D-024). Runs locally; hosting is undecided (Q-45) and nothing is deployed.
 *
 * The project ID and dataset come from the environment (docs/ENV.md). No Sanity project exists yet, so the
 * placeholder lets the schema be extracted, type-generated and built offline; `sanity dev` against real
 * content needs a real project ID and a login.
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';

// Only a default export: the Studio loader treats named exports as the configuration.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'placeholder';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'staging';

export default defineConfig({
  name: 'auburn',
  title: 'Auburn Resources',
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
