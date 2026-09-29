/**
 * URL builders (docs/SITEMAP.md §1). Every internal link to a record goes through here so URL rules
 * live in one place: lowercase, hyphenated, no trailing slash, no extension.
 */
import type { DocumentRecord, Project } from './content/types';

export function projectUrl(project: Pick<Project, 'slug'>): string {
  return `/projects/${project.slug}`;
}

/** Permanent PDF address, served by the Worker proxy (Phase 4+). */
export function documentPdfUrl(document: Pick<DocumentRecord, 'slug'>): string {
  return `/documents/${document.slug}.pdf`;
}

/** HTML page for a document. Only announcements have one (docs/SITEMAP.md §1, 03.1.x). */
export function documentPageUrl(
  document: Pick<DocumentRecord, 'slug' | 'docType'>,
): string | undefined {
  return document.docType === 'announcement'
    ? `/investors/announcements/${document.slug}`
    : undefined;
}
