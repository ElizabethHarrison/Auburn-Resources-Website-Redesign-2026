/**
 * Facts, content classes and the rules that decide what renders.
 *
 * CLAUDE.md §2 is the source of truth. In short:
 * - A **Fact** is a structured value with provenance (`FactMeta`). Numbers reach the page only via Facts.
 * - An **Interpretation** is reviewed prose linked to ≥1 source document (CP review for technical text).
 * - A **Narrative** is short plain text with no digits.
 * - Production renders only `approved` content. Preview renders everything with its status, plus
 *   INPUT NEEDED placeholders for missing values (docs/DECISIONS.md D-005).
 *
 * All visibility decisions go through the functions in this file. Components must not re-implement them.
 */

// ── Primitive types ─────────────────────────────────────────────────────────────────────────────

/** Calendar date, ISO 8601 `YYYY-MM-DD`. */
export type IsoDate = `${number}-${number}-${number}`;

/** Build mode (docs/DECISIONS.md D-005). */
export type ContentMode = 'production' | 'preview';

/** Review status shared by Facts, Interpretations and records. */
export type ContentStatus = 'draft' | 'toVerify' | 'approved' | 'superseded';

export const CONTENT_STATUSES = ['draft', 'toVerify', 'approved', 'superseded'] as const;

/** Reference to a `document` record (announcement, report, website capture, third-party report…). */
export interface DocumentRef {
  readonly documentId: string;
}

/** Reference to a `person` record. */
export interface PersonRef {
  readonly personId: string;
}

// ── Fact ────────────────────────────────────────────────────────────────────────────────────────

/** Provenance and approval state carried by every Fact (docs/SITEMAP.md §8, `factMeta`). */
export interface FactMeta {
  /** Where the value comes from. Required: a fact cannot exist without a source. */
  readonly sourceDocument: DocumentRef;
  /** The date the value is true as at. */
  readonly asAt: IsoDate;
  readonly status: ContentStatus;
  /** Who approved it (company secretary for corporate facts, competent person for technical facts). */
  readonly approvedBy?: PersonRef;
  /** When it was approved (ISO 8601). Required with `approved` when content comes from the CMS (D-027). */
  readonly approvedAt?: string;
  /** When the value must be re-checked. Defaults to `asAt` + 12 months (see `reviewByDate`). */
  readonly reviewBy?: IsoDate;
  /** Internal note for editors and reviewers. Never rendered in production. */
  readonly note?: string;
}

/**
 * A single verifiable value. `T` is the value type (number, string, string[], IsoDate…).
 * Keep the value exactly as stated by its source: never round, estimate or reword it.
 */
export interface Fact<T> {
  readonly kind: 'fact';
  readonly value: T;
  /** Unit as displayed, e.g. `km²`, `%`, `line km`, `m`. */
  readonly unit?: string;
  /** Qualifier exactly as stated by the source, e.g. `over`, `at least`. */
  readonly qualifier?: string;
  readonly meta: FactMeta;
}

/**
 * A value that is known to be needed but has not been supplied. Renders as the dashed copper
 * "INPUT NEEDED" box in preview; hidden in production.
 */
export interface InputNeeded {
  readonly kind: 'inputNeeded';
  /** One-line brief describing what is needed, e.g. "ACN for footer". */
  readonly brief: string;
}

/** Every fact-shaped field in the content model is either a Fact or an explicit gap. */
export type FactSlot<T> = Fact<T> | InputNeeded;

// ── Interpretation and Narrative ─────────────────────────────────────────────────────────────────

/**
 * Reviewed prose tied to its sources. Numbers inside approved Interpretation text are preserved as
 * written (docs/OPEN-QUESTIONS.md Q-06 — no final compliance decision yet); they are not Facts and
 * must not be extracted into data cells.
 */
export interface Interpretation {
  readonly kind: 'interpretation';
  readonly text: string;
  /** At least one source document. */
  readonly sources: readonly [DocumentRef, ...DocumentRef[]];
  readonly status: ContentStatus;
  readonly asAt: IsoDate;
  /** Competent person (technical) or company secretary (corporate) who reviewed it. */
  readonly reviewedBy?: PersonRef;
  readonly note?: string;
}

export type InterpretationSlot = Interpretation | InputNeeded;

/** Short plain text: no digits, character-limited. Validate with `validateNarrative`. */
export interface Narrative {
  readonly kind: 'narrative';
  readonly text: string;
  readonly status: ContentStatus;
}

export type NarrativeSlot = Narrative | InputNeeded;

// ── Constructors (used by fixtures and, later, the Sanity mapper) ───────────────────────────────

export function inputNeeded(brief: string): InputNeeded {
  return { kind: 'inputNeeded', brief };
}

// ── Rendering rules ─────────────────────────────────────────────────────────────────────────────

/** Statuses that may render in each mode. Superseded content never renders. */
const RENDERABLE_STATUSES: Record<ContentMode, readonly ContentStatus[]> = {
  production: ['approved'],
  preview: ['draft', 'toVerify', 'approved'],
};

/**
 * The mode a component may render in. A component may ask for `production` rendering inside a preview
 * build (the catalogue does, to show what the public sees), but can never ask for `preview` rendering
 * inside a production build: the build mode always wins in that direction.
 */
export function clampMode(buildMode: ContentMode, requested?: ContentMode): ContentMode {
  if (buildMode === 'production') return 'production';
  return requested ?? buildMode;
}

export function isStatusRenderable(status: ContentStatus, mode: ContentMode): boolean {
  return RENDERABLE_STATUSES[mode].includes(status);
}

type Reviewable = Fact<unknown> | Interpretation | Narrative;

function statusOf(item: Reviewable): ContentStatus {
  return item.kind === 'fact' ? item.meta.status : item.status;
}

/**
 * Whether a slot produces any output in this mode: its value (with status in preview), or a
 * placeholder (preview only). The single source of truth for fact visibility.
 */
export function isRenderable(
  slot: FactSlot<unknown> | InterpretationSlot | NarrativeSlot | undefined,
  mode: ContentMode,
): boolean {
  if (slot === undefined) return false;
  if (slot.kind === 'inputNeeded') return mode === 'preview';
  return isStatusRenderable(statusOf(slot), mode);
}

/** What a component should draw for a slot. Components switch on `kind`. */
export type Resolved<T extends Reviewable> =
  | { readonly kind: 'value'; readonly item: T; readonly status: ContentStatus }
  | { readonly kind: 'placeholder'; readonly brief: string }
  | { readonly kind: 'hidden' };

export function resolve<T extends Reviewable>(
  slot: T | InputNeeded | undefined,
  mode: ContentMode,
): Resolved<T> {
  if (slot === undefined) return { kind: 'hidden' };
  if (slot.kind === 'inputNeeded') {
    return mode === 'preview' ? { kind: 'placeholder', brief: slot.brief } : { kind: 'hidden' };
  }
  const status = statusOf(slot);
  return isStatusRenderable(status, mode)
    ? { kind: 'value', item: slot, status }
    : { kind: 'hidden' };
}

/**
 * Module visibility. In production a module shows only when every required slot is renderable —
 * modules are hidden, never half-shown (CLAUDE.md §2.1). In preview a module shows when it has any
 * slot at all, so editors can see what is missing.
 *
 * Modules whose cells may drop individually (e.g. the key-facts strip) should instead filter their
 * cells with `isRenderable` and hide when none remain.
 */
export function isModuleVisible(
  required: readonly (FactSlot<unknown> | InterpretationSlot | NarrativeSlot | undefined)[],
  mode: ContentMode,
): boolean {
  if (required.length === 0) return false;
  if (mode === 'preview') return required.some((slot) => slot !== undefined);
  return required.every((slot) => isRenderable(slot, mode));
}

/** Placeholder text form, for contexts that cannot draw the placeholder box (e.g. plain text). */
export function inputNeededLabel(brief: string): string {
  return `[INPUT NEEDED: ${brief}]`;
}

// ── Review dates ────────────────────────────────────────────────────────────────────────────────

/** `reviewBy`, defaulting to `asAt` + 12 months (docs/SITEMAP.md §8). */
export function reviewByDate(meta: FactMeta): IsoDate {
  if (meta.reviewBy) return meta.reviewBy;
  const [year, month, day] = meta.asAt.split('-').map(Number) as [number, number, number];
  // 29 Feb + 12 months → 28 Feb.
  const lastDayOfMonth = new Date(Date.UTC(year + 1, month, 0)).getUTCDate();
  const clampedDay = Math.min(day, lastDayOfMonth);
  return `${year + 1}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}` as IsoDate;
}

/** True when a fact is past its review date (ISO dates compare correctly as strings). */
export function isReviewOverdue(meta: FactMeta, today: IsoDate): boolean {
  return reviewByDate(meta) < today;
}

// ── Narrative validation ────────────────────────────────────────────────────────────────────────

const DIGIT = /\p{Nd}/u;

export function hasDigits(text: string): boolean {
  return DIGIT.test(text);
}

export interface NarrativeIssue {
  readonly code: 'digits' | 'tooLong' | 'empty';
  readonly message: string;
}

/** Narrative rules: non-empty, no digits, at most `maxChars` characters. */
export function validateNarrative(text: string, maxChars: number): NarrativeIssue[] {
  const issues: NarrativeIssue[] = [];
  if (text.trim().length === 0) issues.push({ code: 'empty', message: 'Narrative text is empty.' });
  if (hasDigits(text)) {
    issues.push({ code: 'digits', message: 'Narrative text must not contain digits; use a Fact.' });
  }
  if ([...text].length > maxChars) {
    issues.push({
      code: 'tooLong',
      message: `Narrative text is ${[...text].length} characters; the limit is ${maxChars}.`,
    });
  }
  return issues;
}

/** Character limits from the design direction and sitemap. */
export const NARRATIVE_LIMITS = {
  projectHeroThesis: 120,
} as const;
