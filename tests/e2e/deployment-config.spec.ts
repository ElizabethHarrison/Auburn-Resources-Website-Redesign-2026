/**
 * Deployment safety of workers/edge/wrangler.jsonc and the deploy workflow (docs/DEPLOYMENT.md). Configuration
 * checks only: they run once, in the production project, and need no server.
 */
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { createServer, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { expect, test } from '@playwright/test';
// @ts-expect-error — plain ESM helper shared with tests/static-server.mjs (no type declarations).
import { readWranglerConfig, wranglerEnvironment } from '../wrangler-config.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const workflow = readFileSync(new URL('.github/workflows/deploy.yml', `file://${ROOT}`), 'utf8');

/** Run a repository script with exactly the given environment (no inherited secrets or CI variables). */
function run(script: string, env: Record<string, string>) {
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    env: { PATH: process.env.PATH ?? '', ...env },
    encoding: 'utf8',
  });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

// Obviously fake values: they only satisfy the presence checks and are never sent anywhere.
const COMPLETE = {
  CONTENT_SOURCE: 'sanity',
  SANITY_READ_TOKEN: 'fake-token',
  CLOUDFLARE_API_TOKEN: 'fake-token',
  CLOUDFLARE_ACCOUNT_ID: 'fake-account',
  SANITY_PROJECT_ID: 'fakeproject',
  SANITY_DATASET: 'production',
  SITE_URL: 'https://auburnresources.com.au',
  PREVIEW_URL: 'https://auburn-edge-preview.example.workers.dev',
};

test.describe('deployment configuration', () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'production', 'configuration checks run once');
  });

  test('only production is indexable, and only explicitly', () => {
    expect(wranglerEnvironment('production').vars.SITE_INDEXABLE).toBe('true');
    expect(wranglerEnvironment('preview').vars.SITE_INDEXABLE).not.toBe('true');
  });

  test('production has no Cloudflare hostname of its own; nothing is routed from the repository', () => {
    const production = wranglerEnvironment('production');
    expect(production.workersDev).toBe(false);
    expect(production.previewUrls).toBe(false);
    for (const name of ['production', 'preview']) {
      expect(wranglerEnvironment(name).routes, `${name} routes`).toBeUndefined();
    }
    const config = readWranglerConfig();
    expect(config.account_id).toBeUndefined();
    expect(config.route).toBeUndefined();
  });

  test('preview serves the preview build and keeps per-version preview URLs off', () => {
    const preview = wranglerEnvironment('preview');
    expect(preview.assets.directory).toMatch(/dist-preview$/);
    expect(preview.previewUrls).toBe(false);
    expect(wranglerEnvironment('production').assets.directory).toMatch(/\/dist$/);
  });

  test('both environments run the Worker on the same paths', () => {
    expect(wranglerEnvironment('preview').runWorkerFirst).toEqual(
      wranglerEnvironment('production').runWorkerFirst,
    );
  });

  test('the deploy workflow builds from Sanity, never from fixtures, and is manual only', () => {
    expect(workflow).toMatch(/CONTENT_SOURCE: sanity/);
    expect(workflow).not.toMatch(/CONTENT_SOURCE: (fixtures|sanity-export)/);
    expect(workflow).toMatch(/content source: sanity/); // the post-build assertion on the readiness report
    expect(workflow).toMatch(/^on:\n {2}workflow_dispatch:/m);
    expect(workflow).not.toMatch(/^\s+(push|pull_request|schedule):/m);
  });

  test('pre-flight fails closed when secrets and variables are absent, naming them but not their values', () => {
    for (const target of ['preview', 'production']) {
      const { status, output } = run('scripts/check-deploy-env.mjs', { DEPLOY_TARGET: target });
      expect(status, target).toBe(1);
      for (const name of [
        'CONTENT_SOURCE',
        'SANITY_READ_TOKEN',
        'CLOUDFLARE_API_TOKEN',
        'CLOUDFLARE_ACCOUNT_ID',
        'SANITY_PROJECT_ID',
        'SANITY_DATASET',
        'SITE_URL',
      ]) {
        expect(output, `${target} ${name}`).toContain(name);
      }
      expect(output.includes('PREVIEW_URL'), target).toBe(target === 'preview');
    }
    const oneMissing = run('scripts/check-deploy-env.mjs', {
      ...COMPLETE,
      DEPLOY_TARGET: 'production',
      SANITY_READ_TOKEN: '',
    });
    expect(oneMissing.status).toBe(1);
    expect(oneMissing.output).not.toContain('fake-token');
  });

  test('pre-flight refuses fixtures, the wrong dataset, and production from a branch other than main', () => {
    const cases: [string, Record<string, string>][] = [
      ['fixtures', { ...COMPLETE, DEPLOY_TARGET: 'production', CONTENT_SOURCE: 'fixtures' }],
      ['snapshot', { ...COMPLETE, DEPLOY_TARGET: 'preview', CONTENT_SOURCE: 'sanity-export' }],
      [
        'staging in production',
        { ...COMPLETE, DEPLOY_TARGET: 'production', SANITY_DATASET: 'staging' },
      ],
      [
        'branch',
        {
          ...COMPLETE,
          DEPLOY_TARGET: 'production',
          GITHUB_ACTIONS: 'true',
          GITHUB_REF: 'refs/heads/x',
        },
      ],
      ['no target', { ...COMPLETE }],
      ['http', { ...COMPLETE, DEPLOY_TARGET: 'preview', PREVIEW_URL: 'http://example.com' }],
    ];
    for (const [label, env] of cases) {
      expect(run('scripts/check-deploy-env.mjs', env).status, label).toBe(1);
    }
    for (const target of ['preview', 'production']) {
      const passing = run('scripts/check-deploy-env.mjs', {
        ...COMPLETE,
        DEPLOY_TARGET: target,
        GITHUB_ACTIONS: 'true',
        GITHUB_REF: 'refs/heads/main',
      });
      expect(passing.status, `${target}: ${passing.output}`).toBe(0);
    }
  });

  test('the preview Access check fails on an open hostname and passes only behind Access', async () => {
    let reply = (res: ServerResponse): void => void res.writeHead(500).end();
    const server: Server = createServer((_req, res) => reply(res));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const check = () =>
      new Promise<number | null>((resolve) => {
        const child = spawn(process.execPath, ['scripts/check-preview-access.mjs'], {
          cwd: ROOT,
          env: { PATH: process.env.PATH ?? '', PREVIEW_URL: url },
          stdio: 'ignore',
        });
        child.on('exit', resolve);
      });
    try {
      reply = (res) => void res.writeHead(200).end('public site');
      expect(await check(), 'open hostname').toBe(1);
      reply = (res) =>
        void res.writeHead(302, { Location: 'https://elsewhere.example/login' }).end();
      expect(await check(), 'redirect elsewhere').toBe(1);
      reply = (res) => void res.writeHead(404).end();
      expect(await check(), 'not found').toBe(1);
      reply = (res) =>
        void res
          .writeHead(302, {
            Location: 'https://auburn.cloudflareaccess.com/cdn-cgi/access/login/preview',
          })
          .end();
      expect(await check(), 'Access login redirect').toBe(0);
      reply = (res) => void res.writeHead(403).end();
      expect(await check(), 'Access denies').toBe(0);
    } finally {
      server.close();
    }
    expect(run('scripts/check-preview-access.mjs', {}).status, 'no PREVIEW_URL').toBe(1);
  });

  test('a Sanity build without credentials fails instead of falling back to fixtures', () => {
    test.setTimeout(180_000);
    const result = spawnSync(
      'pnpm',
      ['--filter', '@auburn/site', 'exec', 'astro', 'build', '--outDir', 'dist-deploy-check'],
      {
        cwd: ROOT,
        env: {
          PATH: process.env.PATH ?? '',
          HOME: process.env.HOME ?? '',
          CONTENT_MODE: 'production',
          CONTENT_SOURCE: 'sanity',
          ASTRO_TELEMETRY_DISABLED: '1',
        },
        encoding: 'utf8',
      },
    );
    rmSync(new URL('apps/site/dist-deploy-check', `file://${ROOT}`), {
      recursive: true,
      force: true,
    });
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      'CONTENT_SOURCE=sanity needs SANITY_PROJECT_ID',
    );
  });
});
