/**
 * Studio navigation: singletons first (fixed IDs, so there is exactly one of each), then collections.
 * Fixed IDs match the adapter (apps/site/src/lib/content/sanity/ids.ts).
 */
import type { StructureResolver } from 'sanity/structure';

const SINGLETONS = [
  { id: 'siteSettings', type: 'siteSettings', title: 'Site settings' },
  { id: 'homePage', type: 'homePage', title: 'Home page' },
  { id: 'portfolioPage', type: 'portfolioPage', title: 'Projects page' },
];

const COLLECTIONS = [
  'project',
  'prospect',
  'workItem',
  'resourceEstimate',
  'result',
  'milestone',
  'documentRecord',
  'article',
  'person',
  'figure',
  'photo',
  'page',
  'legalPage',
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...SINGLETONS.map((item) =>
        S.listItem()
          .title(item.title)
          .id(item.id)
          .child(S.document().schemaType(item.type).documentId(item.id)),
      ),
      S.divider(),
      ...COLLECTIONS.map((type) => S.documentTypeListItem(type)),
    ]);
