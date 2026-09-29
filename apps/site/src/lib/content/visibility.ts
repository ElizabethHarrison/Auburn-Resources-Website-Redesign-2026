/**
 * Record-level visibility: whether a whole record (a register row, a person card, a project card) may
 * appear in a given mode. Built on the slot rules in lib/facts.ts — records are hidden, never
 * half-shown, in production.
 */
import { isRenderable, isStatusRenderable, type ContentMode } from '../facts';
import type {
  Article,
  DocType,
  DocumentRecord,
  FigureRecord,
  FigureSlot,
  Person,
  Project,
} from './types';

/**
 * A document appears in a register when it is public, the record is renderable, and — in production —
 * its release date and file are approved. Preview shows every public record, with placeholders.
 */
export function isDocumentListable(document: DocumentRecord, mode: ContentMode): boolean {
  if (document.internal) return false;
  if (!isStatusRenderable(document.status, mode)) return false;
  if (mode === 'preview') return true;
  return isRenderable(document.releaseAt, mode) && isRenderable(document.file, mode);
}

/** A person card needs at least an approved role in production; the bio may drop on its own. */
export function isPersonListable(person: Person, mode: ContentMode): boolean {
  return mode === 'preview' || isRenderable(person.role, mode);
}

/**
 * A project may be listed (cards, menus, footer) only when it is confirmed as held. Until the verified
 * project list exists (docs/OPEN-QUESTIONS.md Q-20), no project is listable in production.
 */
export function isProjectListable(project: Project, mode: ContentMode): boolean {
  if (mode === 'preview') return true;
  const { holding } = project;
  return holding.kind === 'fact' && isRenderable(holding, mode) && holding.value !== 'noLongerHeld';
}

// ── Figures ─────────────────────────────────────────────────────────────────────────────────────

export type ResolvedFigure =
  | { readonly kind: 'figure'; readonly figure: FigureRecord }
  | { readonly kind: 'placeholder'; readonly brief: string }
  | { readonly kind: 'hidden' };

/** A supplied, renderable figure; a placeholder in preview; otherwise hidden. Never a stand-in image. */
export function resolveFigure(slot: FigureSlot | undefined, mode: ContentMode): ResolvedFigure {
  if (slot === undefined) return { kind: 'hidden' };
  if (slot.kind === 'inputNeeded') {
    return mode === 'preview' ? { kind: 'placeholder', brief: slot.brief } : { kind: 'hidden' };
  }
  return isStatusRenderable(slot.status, mode)
    ? { kind: 'figure', figure: slot }
    : { kind: 'hidden' };
}

// ── Latest documents and articles ───────────────────────────────────────────────────────────────

function releaseValue(document: DocumentRecord): string {
  return document.releaseAt.kind === 'fact' ? document.releaseAt.value : '';
}

/**
 * Listable documents, newest first (undated records last), optionally limited to some types.
 * The result is what registers may show in this mode — nothing more.
 */
export function latestDocuments(
  documents: readonly DocumentRecord[],
  mode: ContentMode,
  options: { readonly docTypes?: readonly DocType[]; readonly limit?: number } = {},
): DocumentRecord[] {
  const { docTypes, limit } = options;
  const listed = documents
    .filter((document) => isDocumentListable(document, mode))
    .filter((document) => !docTypes || docTypes.includes(document.docType))
    .sort((a, b) => releaseValue(b).localeCompare(releaseValue(a)));
  return limit === undefined ? listed : listed.slice(0, limit);
}

/** Articles that may appear: approved (or, in preview, draft/to verify) with a renderable date. */
export function latestArticles(
  articles: readonly Article[],
  mode: ContentMode,
  limit?: number,
): Article[] {
  const listed = articles
    .filter(
      (article) => isStatusRenderable(article.status, mode) && isRenderable(article.date, mode),
    )
    .sort((a, b) =>
      (b.date.kind === 'fact' ? b.date.value : '').localeCompare(
        a.date.kind === 'fact' ? a.date.value : '',
      ),
    );
  return limit === undefined ? listed : listed.slice(0, limit);
}
