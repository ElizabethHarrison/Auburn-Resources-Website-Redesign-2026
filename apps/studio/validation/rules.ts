/**
 * Editorial guardrails (docs/SITEMAP.md §8 "Studio guardrails"; D-024, D-027). Pure functions so they are
 * unit-tested, and wired into the schemas as custom validation.
 *
 * These help editors; they are NOT the security boundary. The site's build re-validates everything and fails
 * closed (apps/site/src/lib/content/sanity/validate.ts), because Studio validation can be bypassed through the
 * API and, without Enterprise custom roles, the CMS cannot restrict who approves (D-027).
 */

export const STATUSES = ['draft', 'toVerify', 'approved', 'superseded'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_OPTIONS = [
  { title: 'Draft', value: 'draft' },
  { title: 'To verify', value: 'toVerify' },
  { title: 'Approved (company secretary or competent person only)', value: 'approved' },
  { title: 'Superseded', value: 'superseded' },
];

/**
 * Held-back (HOLD) wording from docs/CONTENT-SOURCE.md that must never be stored or rendered, and other banned
 * strings (CLAUDE.md §2.3–2.4). Keep in step with the site's copy (a test compares them).
 */
export const HELD_BACK_PATTERNS: readonly RegExp[] = [
  /40\s?Mt/i, // Nicholson exploration-target wording
  /200\s?Mt/i, // Calgoa exploration-target wording
  /25\s?Mt/i, // Calgoa oxide wording
  /smoke/i, // promotional line
  /aircore/i, // Hawkwood outdated work plan
  /entitlement offer/i, // 2021 Entitlement Offer (HOLD)
  /email@email\.com/i,
  /squarespace\.com/i,
  /pexels/i,
  /227\s?Mt/i, // unsourced third-party figures
  /13\.6\s?Mt/i,
  /77\.6\s?Mt/i,
];

export function heldBackIssue(text: string | undefined): string | true {
  if (!text) return true;
  const hit = HELD_BACK_PATTERNS.find((pattern) => pattern.test(text));
  return hit
    ? `Contains held-back or banned wording (${hit.source}); it must not be stored.`
    : true;
}

/** Narrative: plain text, no digits (CLAUDE.md §2.2). */
export function narrativeIssue(text: string | undefined, maxLength?: number): string | true {
  if (!text) return true;
  if (/\d/.test(text)) return 'Narrative text may not contain digits; numbers belong in facts.';
  if (maxLength !== undefined && [...text].length > maxLength)
    return `At most ${maxLength} characters.`;
  return heldBackIssue(text);
}

export interface FactMetaInput {
  readonly status?: string | undefined;
  readonly sourceDocument?: { readonly _ref?: string } | undefined;
  readonly asAt?: string | undefined;
  readonly approvedBy?: { readonly _ref?: string } | undefined;
  readonly approvedAt?: string | undefined;
}

/**
 * A fact cannot leave Draft without a source; an approved fact also needs its as-at date, approver and approval
 * date. (Whether the approver may approve this kind of fact is checked at build time.)
 */
export function factMetaIssue(meta: FactMetaInput | undefined, hasValue: boolean): string | true {
  if (!hasValue) return true;
  if (!meta?.status) return 'Set a review status.';
  if (meta.status !== 'draft' && !meta.sourceDocument?._ref)
    return 'A fact cannot leave Draft without a source document.';
  if (meta.status === 'approved') {
    const missing = [
      !meta.asAt && 'as-at date',
      !meta.approvedBy?._ref && 'approved by',
      !meta.approvedAt && 'approval date',
    ].filter(Boolean);
    if (missing.length > 0) return `Approval needs: ${missing.join(', ')}.`;
  }
  return true;
}

export interface InterpretationInput {
  readonly text?: string | undefined;
  readonly status?: string | undefined;
  readonly sources?: readonly { readonly _ref?: string }[] | undefined;
  readonly asAt?: string | undefined;
  readonly reviewedBy?: { readonly _ref?: string } | undefined;
}

export function interpretationIssue(value: InterpretationInput | undefined): string | true {
  if (!value?.text) return true;
  const held = heldBackIssue(value.text);
  if (held !== true) return held;
  if (!value.status) return 'Set a review status.';
  if (value.status !== 'draft' && !(value.sources ?? []).some((source) => source._ref)) {
    return 'Interpretation needs at least one source document.';
  }
  if (value.status === 'approved' && (!value.asAt || !value.reviewedBy?._ref)) {
    return 'Approval needs an as-at date and the reviewer (competent person or company secretary).';
  }
  return true;
}
