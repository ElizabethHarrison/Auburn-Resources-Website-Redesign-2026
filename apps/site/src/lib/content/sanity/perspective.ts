/**
 * Which document versions a build sees (D-024 §4–5), applied to raw documents from either source (live API or
 * NDJSON snapshot). For the live API the query perspective already does this; applying it again is a defence in
 * depth, so a draft can never reach a production build.
 *
 * - production: published documents only (`drafts.*` and `versions.*` dropped).
 * - preview: drafts over published (a draft replaces its published document, under the published ID).
 */
import type { ContentMode } from '../../facts';

export interface RawDocument {
  readonly _id: string;
  readonly _type: string;
  readonly [field: string]: unknown;
}

const DRAFT = 'drafts.';
const VERSION = 'versions.';

export function applyPerspective(
  documents: readonly RawDocument[],
  mode: ContentMode,
): RawDocument[] {
  const published = documents.filter(
    (document) => !document._id.startsWith(DRAFT) && !document._id.startsWith(VERSION),
  );
  if (mode === 'production') return published;
  const drafts = new Map(
    documents
      .filter((document) => document._id.startsWith(DRAFT))
      .map((document) => [
        document._id.slice(DRAFT.length),
        { ...document, _id: document._id.slice(DRAFT.length) },
      ]),
  );
  const merged = published.map((document) => drafts.get(document._id) ?? document);
  const draftOnly = [...drafts.values()].filter(
    (draft) => !published.some((document) => document._id === draft._id),
  );
  return [...merged, ...draftOnly];
}
