# Auburn Resources website

Source for the rebuild of **auburnresources.com.au** for Auburn Resources Limited.

**Status:** Phase 1 (scaffold) complete. No public pages yet — see `CLAUDE.md` → "Current state".

## Getting started

Requires **Node 24** (see `.nvmrc`) and **pnpm 10** (via Corepack).

```sh
corepack enable
pnpm install
pnpm dev          # http://localhost:4321 — preview mode, placeholders visible
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server in preview mode |
| `pnpm build` | Production build (Approved content only) → `apps/site/dist` |
| `pnpm build:preview` | Preview build (all statuses, noindex) → `apps/site/dist-preview` |
| `pnpm test` | Unit tests |
| `pnpm lint` / `pnpm format` | ESLint + Prettier check / fix |
| `pnpm typecheck` | `astro check` |
| `pnpm check` | Everything CI runs — use before pushing |

Environment variables: [`docs/ENV.md`](docs/ENV.md).

## Repository

```
apps/site/     Astro site (static)
docs/          strategy, sitemap, design, content source, decisions, open questions, env
.github/       CI
```

## Documents

| Document | What it covers |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | Rules for anyone (human or AI) working in this repo: content rules, conventions, what needs approval |
| [`docs/WEBSITE-STRATEGY.md`](docs/WEBSITE-STRATEGY.md) | Why the site exists, audiences, homepage, technical decisions, build phases |
| [`docs/SITEMAP.md`](docs/SITEMAP.md) | Pages, URLs, navigation, page specs, content model, redirects |
| [`docs/DESIGN-DIRECTION.md`](docs/DESIGN-DIRECTION.md) | The approved "Survey Sheet" design system |
| [`docs/CONTENT-SOURCE.md`](docs/CONTENT-SOURCE.md) | Content captured from the current site — all unverified |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Decision log |
| [`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md) | Questions awaiting a human decision |
| [`docs/ENV.md`](docs/ENV.md) | Toolchain, environment variables, environments |

## Stack

Astro (static) · TypeScript · Preact islands · plain CSS tokens · Sanity CMS · Cloudflare.
