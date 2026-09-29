/**
 * Source lookup for provenance lines. Pages build the index once from `content.getDocuments()` and pass
 * it to fact components, which never fetch.
 */
import type { ContentStatus, DocumentRef, Fact, Interpretation, IsoDate } from '../facts';
import type { DocumentRecord } from './types';

export type SourceIndex = ReadonlyMap<string, DocumentRecord>;

export function createSourceIndex(documents: readonly DocumentRecord[]): SourceIndex {
  return new Map(documents.map((document) => [document.id, document]));
}

export interface Provenance {
  readonly source: DocumentRef;
  readonly asAt: IsoDate;
  readonly status: ContentStatus;
}

/** Where a Fact or Interpretation comes from, in one shape. Interpretations cite their first source. */
export function provenanceOf(item: Fact<unknown> | Interpretation): Provenance {
  return item.kind === 'fact'
    ? { source: item.meta.sourceDocument, asAt: item.meta.asAt, status: item.meta.status }
    : { source: item.sources[0], asAt: item.asAt, status: item.status };
}
