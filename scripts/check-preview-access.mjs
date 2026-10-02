#!/usr/bin/env node
/* global fetch -- Node 24 built-in */
/**
 * Proves the preview hostname is behind Cloudflare Access (docs/DEPLOYMENT.md §3): an unauthenticated request must be
 * refused (401/403) or redirected to a `*.cloudflareaccess.com` login. Anything else — above all a 200 — fails, so
 * the deploy workflow stops before the preview build could become public. Run before and after deploying. No
 * dependencies.
 *
 * Usage: PREVIEW_URL=https://… node scripts/check-preview-access.mjs
 */
const target = process.env.PREVIEW_URL;
if (!target) {
  console.error('::error::PREVIEW_URL is not set; cannot prove the preview is protected.');
  process.exit(1);
}

let response;
try {
  response = await fetch(new URL('/', target), { redirect: 'manual' });
} catch (error) {
  console.error(`::error::Could not reach ${new URL(target).host}: ${error.message}`);
  process.exit(1);
}

const location = response.headers.get('location') ?? '';
const toAccessLogin = (() => {
  try {
    return new URL(location, target).hostname.endsWith('.cloudflareaccess.com');
  } catch {
    return false;
  }
})();
const protectedResponse =
  response.status === 401 ||
  response.status === 403 ||
  (response.status >= 300 && response.status < 400 && toAccessLogin);

if (!protectedResponse) {
  console.error(
    `::error::${new URL(target).host} answered ${response.status} without Cloudflare Access` +
      `${location ? ` (redirect to ${new URL(location, target).host})` : ''}. ` +
      'Add an Access application for this hostname before deploying the preview (docs/DEPLOYMENT.md §3).',
  );
  process.exit(1);
}
console.log(`Preview is behind Cloudflare Access (${response.status}).`);
