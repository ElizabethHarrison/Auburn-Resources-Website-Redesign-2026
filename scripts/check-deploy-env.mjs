#!/usr/bin/env node
/**
 * Pre-flight for .github/workflows/deploy.yml (docs/DEPLOYMENT.md): refuse to build or deploy unless every setting
 * the target needs is present and consistent. Fails closed: there is no fallback to fixtures or to defaults.
 * Prints the names of missing settings, never their values. No dependencies.
 *
 * Usage: DEPLOY_TARGET=preview|production node scripts/check-deploy-env.mjs
 */
const env = process.env;
const target = env.DEPLOY_TARGET;
const errors = [];
const fail = (message) => errors.push(message);

if (target !== 'preview' && target !== 'production') {
  fail(`DEPLOY_TARGET must be "preview" or "production" (got "${target ?? ''}").`);
}

// Live content only: the deploy never builds from fixtures or the NDJSON snapshot.
if (env.CONTENT_SOURCE !== 'sanity') {
  fail(`CONTENT_SOURCE must be "sanity" for a deployment (got "${env.CONTENT_SOURCE ?? ''}").`);
}

const REQUIRED = {
  // GitHub Environment secrets
  SANITY_READ_TOKEN: 'secret',
  CLOUDFLARE_API_TOKEN: 'secret',
  CLOUDFLARE_ACCOUNT_ID: 'secret',
  // GitHub Environment variables
  SANITY_PROJECT_ID: 'variable',
  SANITY_DATASET: 'variable',
  SITE_URL: 'variable',
  ...(target === 'preview' ? { PREVIEW_URL: 'variable' } : {}),
};
for (const [name, kind] of Object.entries(REQUIRED)) {
  if (!env[name] || env[name].trim() === '') {
    fail(`Missing ${kind} ${name} in the "${target}" GitHub Environment.`);
  }
}

// Production reads only the production dataset (docs/CMS.md §7); preview may use staging or production (drafts).
if (env.SANITY_DATASET) {
  const allowed = target === 'production' ? ['production'] : ['staging', 'production'];
  if (!allowed.includes(env.SANITY_DATASET)) {
    fail(`SANITY_DATASET for ${target} must be one of: ${allowed.join(', ')}.`);
  }
}

// Production deploys only from main, the reviewed branch.
if (
  target === 'production' &&
  env.GITHUB_ACTIONS === 'true' &&
  env.GITHUB_REF !== 'refs/heads/main'
) {
  fail(`Production deploys only from main (this run is on ${env.GITHUB_REF}).`);
}

for (const [name, value] of [
  ['SITE_URL', env.SITE_URL],
  ['PREVIEW_URL', env.PREVIEW_URL],
]) {
  if (!value) continue;
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${name} is not a URL.`);
    continue;
  }
  if (url.protocol !== 'https:') fail(`${name} must use https.`);
}

// The production site URL is the canonical host; a preview must never claim it as its own address.
if (
  target === 'production' &&
  env.SITE_URL &&
  new URL(env.SITE_URL).hostname.endsWith('workers.dev')
) {
  fail('SITE_URL for production must be the public domain, not a workers.dev address.');
}

if (errors.length > 0) {
  for (const message of errors) console.error(`::error::${message}`);
  console.error(`Deployment pre-flight failed (${errors.length}). Nothing was built or deployed.`);
  process.exit(1);
}
console.log(`Deployment pre-flight passed for ${target}.`);
