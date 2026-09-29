/**
 * Data every page frame needs (header, footer): site settings and the projects that may be listed in
 * this mode. Pages call this once and pass the result to SiteLayout; components never fetch.
 */
import type { ContentMode } from '../facts';
import type { ContentAdapter } from './adapter';
import type { Project, SiteSettings } from './types';
import { isProjectListable } from './visibility';

export interface FrameData {
  readonly settings: SiteSettings;
  /** Projects that may appear in menus and the footer in this mode. */
  readonly projects: readonly Project[];
}

export async function loadFrame(adapter: ContentAdapter, mode: ContentMode): Promise<FrameData> {
  const [settings, projects] = await Promise.all([adapter.getSiteSettings(), adapter.getProjects()]);
  return { settings, projects: projects.filter((project) => isProjectListable(project, mode)) };
}
