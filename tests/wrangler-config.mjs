/**
 * Reads workers/edge/wrangler.jsonc (JSON with comments and trailing commas) so the local server and the tests
 * follow the same configuration Cloudflare deploys, instead of re-stating it. No dependencies.
 */
import { readFileSync } from 'node:fs';

const CONFIG_URL = new URL('../workers/edge/wrangler.jsonc', import.meta.url);

/** Remove // and /* *\/ comments outside strings, then trailing commas. */
function stripJsonc(text) {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      out += char;
      if (char === '\\') out += text[++i] ?? '';
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
      out += char;
    } else if (char === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i += 1;
      out += '\n';
    } else if (char === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2) + 1;
    } else {
      out += char;
    }
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

export function readWranglerConfig() {
  return JSON.parse(stripJsonc(readFileSync(CONFIG_URL, 'utf8')));
}

/**
 * The settings one environment deploys with: `production` is the top level, `preview` is `env.preview`.
 * `vars` are not inherited by named environments in Wrangler, so preview gets only its own.
 */
export function wranglerEnvironment(name) {
  const config = readWranglerConfig();
  const env = name === 'production' ? config : config.env?.[name];
  if (!env) throw new Error(`wrangler.jsonc has no "${name}" environment`);
  const assets = env.assets ?? config.assets;
  return {
    name: env.name ?? config.name,
    vars: env.vars ?? {},
    workersDev: env.workers_dev ?? (name === 'production' ? config.workers_dev : undefined),
    previewUrls: env.preview_urls ?? config.preview_urls,
    routes: env.routes ?? (name === 'production' ? config.routes : undefined),
    assets,
    runWorkerFirst: assets?.run_worker_first ?? [],
  };
}

/** Whether a request path runs the Worker first (exact paths, or a trailing `/*` wildcard). */
export function runsWorkerFirst(patterns, pathname) {
  return patterns.some((pattern) =>
    pattern.endsWith('/*') ? pathname.startsWith(pattern.slice(0, -1)) : pathname === pattern,
  );
}
