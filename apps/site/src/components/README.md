# Components

Layered as **Tokens → Primitives → Patterns → Modules → Templates** (CLAUDE.md §5). Each layer imports
only from layers below it. Components arrive in Phase 2.

| Folder | Layer | Examples |
| --- | --- | --- |
| `primitives/` | Smallest building blocks | Button, Tag, MonoLabel, Rule, DateMono, SheetRef |
| `patterns/` | Composed, reusable UI | Header, Breadcrumb, FactCell, Figure, DocumentRegister, Footer |
| `modules/` | Page sections; render nothing when empty | Home hero, project modules 01–09 |
| `islands/` | Preact; the only client-side code | MobileMenu, MapIsland, DocFilter |

Templates live in `src/layouts/`; routes in `src/pages/` mirror `docs/SITEMAP.md`.

Rules for every component:

- Style with tokens from `src/styles/tokens.css` only: no raw hex values, no spacing outside the scale.
- Fact components accept `Fact` objects and decide visibility with `resolve()` / `isRenderable()` from
  `src/lib/facts.ts`. Never re-implement those rules.
- Never fetch content. Pages load it through `src/lib/content` and pass it down as props.
- Add every new pattern to `/_catalogue`.
