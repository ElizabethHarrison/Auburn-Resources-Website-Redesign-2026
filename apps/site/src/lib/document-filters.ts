/**
 * Document-filter states for the investor listings (D-023; docs/WORKER.md). The build generates one static
 * page per valid state from the documents listable in that build; the edge Worker maps query strings
 * (`?year=2022&type=quarterly`) to those pages. The state slug format here must match
 * `workers/edge/src/document-filters.ts` (end-to-end tests exercise both together).
 *
 * Nothing is invented: years and types come only from listable documents in this mode.
 */
import type { ContentMode } from './facts';
import type { DocType, DocumentRecord, PageKey } from './content/types';
import { isDocumentListable } from './content/visibility';
import { DOC_TYPE_LABELS } from './format';

export type ListingKey = 'announcements' | 'reports' | 'presentations';

export interface Listing {
  readonly key: ListingKey & PageKey;
  readonly path: string;
  readonly heading: string;
  /** Lower-case plural for sentences, e.g. "announcements". */
  readonly noun: string;
  readonly description: string;
  readonly docTypes: readonly DocType[];
  /** Whether the listing can be filtered by document type (reports only). */
  readonly typeFilter: boolean;
  /** Preview placeholder brief when nothing is recorded. */
  readonly emptyBrief: string;
}

export const LISTINGS: Record<ListingKey, Listing> = {
  announcements: {
    key: 'announcements',
    path: '/investors/announcements',
    heading: 'Announcements',
    noun: 'announcements',
    description:
      'Every Auburn Resources announcement, newest first, each with its own page and PDF.',
    docTypes: ['announcement'],
    typeFilter: false,
    emptyBrief: 'Announcements, each with its release date, reference and re-hosted PDF',
  },
  reports: {
    key: 'reports',
    path: '/investors/reports',
    heading: 'Reports',
    noun: 'reports',
    description:
      'Annual, half-yearly and quarterly reports and meeting notices from Auburn Resources, newest first.',
    docTypes: ['annual', 'halfYear', 'quarterly', 'notice'],
    typeFilter: true,
    emptyBrief: 'Annual reports 2023–2025, half-year and quarterly reports',
  },
  presentations: {
    key: 'presentations',
    path: '/investors/presentations',
    heading: 'Presentations',
    noun: 'presentations',
    description:
      'Corporate presentations from Auburn Resources, newest first, with the archive of earlier presentations.',
    docTypes: ['presentation'],
    typeFilter: false,
    emptyBrief: 'Current corporate presentation and archive',
  },
};

/** Report types as URL slugs (`?type=half-year`). Fixed list; the Worker holds the same list. */
export const TYPE_SLUGS: Partial<Record<DocType, string>> = {
  annual: 'annual',
  halfYear: 'half-year',
  quarterly: 'quarterly',
  notice: 'notice',
};

export interface FilterState {
  readonly year?: string | undefined;
  readonly type?: DocType | undefined;
}

export interface FilterOptions {
  /** Newest first. */
  readonly years: readonly string[];
  /** In the listing's document-type order. */
  readonly types: readonly DocType[];
}

const yearOf = (document: DocumentRecord): string | undefined =>
  document.releaseAt.kind === 'fact' ? document.releaseAt.value.slice(0, 4) : undefined;

/** Documents this listing shows in this mode (listable, of the listing's types). */
export function listingDocuments(
  documents: readonly DocumentRecord[],
  listing: Listing,
  mode: ContentMode,
): DocumentRecord[] {
  return documents.filter(
    (document) => listing.docTypes.includes(document.docType) && isDocumentListable(document, mode),
  );
}

/** The years and types present among the listing's visible documents — nothing else. */
export function filterOptions(
  documents: readonly DocumentRecord[],
  listing: Listing,
  mode: ContentMode,
): FilterOptions {
  const visible = listingDocuments(documents, listing, mode);
  const years = [...new Set(visible.flatMap((document) => yearOf(document) ?? []))]
    .sort()
    .reverse();
  const types = listing.typeFilter
    ? listing.docTypes.filter((type) => visible.some((document) => document.docType === type))
    : [];
  return { years, types };
}

/** Every state the form can submit: each year, each type, and every year × type pair. */
export function filterStates(options: FilterOptions): FilterState[] {
  const years = options.years.map((year) => ({ year }));
  const types = options.types.map((type) => ({ type }));
  const pairs = options.years.flatMap((year) => options.types.map((type) => ({ year, type })));
  return [...years, ...types, ...pairs];
}

/** `year-2022`, `type-quarterly`, `year-2022-type-quarterly`. */
export function stateSlug(state: FilterState): string {
  const parts = [
    state.year === undefined ? undefined : `year-${state.year}`,
    state.type === undefined ? undefined : `type-${TYPE_SLUGS[state.type] ?? state.type}`,
  ];
  return parts.filter((part) => part !== undefined).join('-');
}

export function isFiltered(state: FilterState): boolean {
  return state.year !== undefined || state.type !== undefined;
}

/** The listing's visible documents matching the state. */
export function applyFilter(
  documents: readonly DocumentRecord[],
  listing: Listing,
  state: FilterState,
  mode: ContentMode,
): DocumentRecord[] {
  return listingDocuments(documents, listing, mode).filter(
    (document) =>
      (state.year === undefined || yearOf(document) === state.year) &&
      (state.type === undefined || document.docType === state.type),
  );
}

/** Human description of the state, e.g. "2022 · Annual report". */
export function describeState(state: FilterState): string {
  return [state.year, state.type ? DOC_TYPE_LABELS[state.type] : undefined]
    .filter((part) => part !== undefined)
    .join(' · ');
}
