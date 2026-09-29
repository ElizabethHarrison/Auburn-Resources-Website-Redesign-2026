#!/usr/bin/env node
/**
 * Minimal static server for end-to-end tests: serves a build directory the way Cloudflare static assets
 * will (`/company` → company.html, `/` → index.html, unknown paths → 404). No dependencies.
 *
 * Usage: node tests/static-server.mjs <dir> <port>
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const [dirArg, portArg] = process.argv.slice(2);
const root = resolve(dirArg ?? 'dist');
const port = Number(portArg ?? 4600);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function locate(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(root, safe);
  if (!base.startsWith(root)) return undefined;
  const candidates = safe.endsWith('/')
    ? [join(base, 'index.html')]
    : [base, `${base}.html`, join(base, 'index.html')];
  for (const candidate of candidates) if (await isFile(candidate)) return candidate;
  return undefined;
}

createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  const file = await locate(pathname);
  if (!file) {
    const notFound = join(root, '404.html');
    response.writeHead(404, { 'Content-Type': TYPES['.html'] });
    response.end((await isFile(notFound)) ? await readFile(notFound) : 'Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  response.end(await readFile(file));
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
