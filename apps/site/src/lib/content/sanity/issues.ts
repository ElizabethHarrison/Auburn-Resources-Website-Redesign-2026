/**
 * Content integrity issues found while mapping CMS records (D-024, D-026, D-027).
 *
 * - `fatal`: held-back wording. Never stored, never rendered: the build fails in every mode.
 * - `error`: an approval or provenance problem. The content is already downgraded or hidden (fail closed); a
 *   production build also fails, so the problem is fixed before publishing rather than silently dropped.
 * - `warning`: e.g. a review-by date has passed (D-026) or an unapproved record is malformed. Reported only.
 */
export type Severity = 'fatal' | 'error' | 'warning';

export interface ContentIssue {
  readonly severity: Severity;
  readonly documentId: string;
  readonly path: string;
  readonly message: string;
}

export class IssueLog {
  readonly issues: ContentIssue[] = [];

  add(severity: Severity, documentId: string, path: string, message: string): void {
    this.issues.push({ severity, documentId, path, message });
  }

  of(severity: Severity): ContentIssue[] {
    return this.issues.filter((issue) => issue.severity === severity);
  }
}

export class ContentIntegrityError extends Error {
  constructor(readonly issues: readonly ContentIssue[]) {
    super(
      `CMS content failed integrity checks (${issues.length}):\n` +
        issues
          .map(
            (issue) => `  [${issue.severity}] ${issue.documentId} ${issue.path}: ${issue.message}`,
          )
          .join('\n'),
    );
    this.name = 'ContentIntegrityError';
  }
}

export const formatIssue = (issue: ContentIssue): string =>
  `[${issue.severity}] ${issue.documentId} ${issue.path}: ${issue.message}`;
