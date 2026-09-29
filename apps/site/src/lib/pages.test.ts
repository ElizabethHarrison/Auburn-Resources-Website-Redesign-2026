import { describe, expect, it } from 'vitest';
import { SECTIONS } from './navigation';
import { sectionPageFrame, utilityBreadcrumbs } from './pages';

describe('sectionPageFrame', () => {
  it('ends a landing page breadcrumb at the section', () => {
    const frame = sectionPageFrame('03', '/investors');
    expect(frame.breadcrumbs.map((item) => item.name)).toEqual(['Home', '03 Investors']);
    expect(frame.sheet).toBe('03');
  });

  it('adds the sheet and label for pages inside a section', () => {
    const frame = sectionPageFrame('03', '/investors/governance');
    expect(frame.breadcrumbs.at(-1)).toEqual({
      name: '03.5 Governance',
      path: '/investors/governance',
    });
    expect(frame.sectionBar.currentHref).toBe('/investors/governance');
  });

  it('inserts listable projects into the 02 section bar', () => {
    const frame = sectionPageFrame('02', '/projects/how-we-explore', [
      { sheet: '02.1', label: 'Nicholson', href: '/projects/nicholson' },
    ]);
    expect(frame.sectionBar.pages.map((page) => page.href)).toEqual([
      '/projects',
      '/projects/nicholson',
      '/projects/how-we-explore',
    ]);
  });

  it('has a frame for every page of every section', () => {
    for (const section of SECTIONS) {
      for (const page of section.pages)
        expect(() => sectionPageFrame(section.id, page.href)).not.toThrow();
    }
    expect(() => sectionPageFrame('01', '/nowhere')).toThrow();
  });

  it('builds utility breadcrumbs without sheet numbers', () => {
    expect(utilityBreadcrumbs('Contact', '/contact')).toEqual([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ]);
  });
});
