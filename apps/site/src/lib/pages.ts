/**
 * Page frame helpers for the fixed pages: breadcrumbs and the section bar, derived from the approved
 * navigation (lib/navigation.ts), so every page uses the same labels, sheet numbers and URLs.
 */
import type { SheetNumber } from './content/types';
import { projectSectionPages, sectionById, type NavLink, type SectionId } from './navigation';
import type { BreadcrumbItem } from './seo';

export interface SectionPageFrame {
  readonly sheet: SheetNumber;
  readonly label: string;
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly sectionBar: { sectionLabel: string; pages: readonly NavLink[]; currentHref: string };
}

/**
 * Frame for a page inside one of the five numbered sections. `href` must be one of the section's
 * pages; the landing page's breadcrumb ends at the section itself.
 * `projectLinks` are the project dossiers listable in this mode (section 02 only).
 */
export function sectionPageFrame(
  sectionId: SectionId,
  href: string,
  projectLinks: readonly NavLink[] = [],
): SectionPageFrame {
  const section = sectionById(sectionId);
  const page = section.pages.find((candidate) => candidate.href === href);
  if (!page?.sheet) throw new Error(`${href} is not a page of section ${sectionId}`);
  const sectionLabel = `${section.sheet} ${section.label}`;
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', path: '/' },
    { name: sectionLabel, path: section.href },
  ];
  if (href !== section.href) breadcrumbs.push({ name: `${page.sheet} ${page.label}`, path: href });
  const pages = sectionId === '02' ? projectSectionPages(projectLinks) : section.pages;
  return {
    sheet: page.sheet,
    label: page.label,
    breadcrumbs,
    sectionBar: { sectionLabel, pages, currentHref: href },
  };
}

/** Breadcrumbs for utility and legal pages, which have no sheet number (D-010). */
export function utilityBreadcrumbs(name: string, path: string): readonly BreadcrumbItem[] {
  return [
    { name: 'Home', path: '/' },
    { name, path },
  ];
}
