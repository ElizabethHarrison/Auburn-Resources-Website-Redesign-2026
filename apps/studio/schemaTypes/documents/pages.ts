/** Articles, page copy and legal pages (docs/SITEMAP.md §6, §8). Legal text is supplied by the company (Q-24). */
import { defineField, defineType } from 'sanity';
import {
  approvalFields,
  fact,
  orderField,
  interpretationField,
  narrativeField,
  recordStatus,
  requiredString,
} from '../fields';

const PAGE_KEYS = [
  'company',
  'leadership',
  'howWeExplore',
  'investors',
  'announcements',
  'reports',
  'presentations',
  'shareholders',
  'governance',
  'alerts',
  'sustainability',
  'community',
  'environmentSafety',
  'news',
  'media',
  'contact',
];

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    orderField,
    requiredString('title', 'Title'),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    fact('date', 'factDate', 'Date'),
    narrativeField('lead', 'Lead'),
    recordStatus,
    ...approvalFields,
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'linkedDocument',
      title: 'Linked announcement',
      type: 'reference',
      to: [{ type: 'documentRecord' }],
    }),
  ],
});

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fields: [
    narrativeField('heroHeading', 'Hero heading'),
    narrativeField('heroIntro', 'Hero introduction'),
    defineField({ name: 'portfolioMap', title: 'Portfolio map (Fig. 1)', type: 'figureSlot' }),
    narrativeField('whyHeading', '"Why this ground" heading'),
    interpretationField('whyText', '"Why this ground" text'),
    defineField({ name: 'crossSection', title: 'Cross-section (Fig. 2)', type: 'figureSlot' }),
    narrativeField('sustainabilityLine', 'Sustainability line'),
  ],
  preview: { prepare: () => ({ title: 'Home page' }) },
});

export const portfolioPage = defineType({
  name: 'portfolioPage',
  title: 'Projects page',
  type: 'document',
  fields: [
    narrativeField('intro', 'Introduction'),
    defineField({ name: 'portfolioMap', title: 'Portfolio map (Fig. 1)', type: 'figureSlot' }),
  ],
  preview: { prepare: () => ({ title: 'Projects page' }) },
});

export const pageSection = defineType({
  name: 'pageSection',
  title: 'Section',
  type: 'object',
  fields: [
    requiredString('sectionId', 'Anchor id'),
    requiredString('heading', 'Heading (section name from the sitemap)'),
    defineField({
      name: 'paragraphs',
      title: 'Paragraphs',
      type: 'array',
      of: [{ type: 'narrative' }, { type: 'interpretation' }],
    }),
    defineField({
      name: 'forwardLooking',
      title: 'Forward-looking (links to the disclaimer)',
      type: 'boolean',
    }),
  ],
});

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Page',
      type: 'string',
      options: { list: PAGE_KEYS },
      validation: (rule) => rule.required(),
    }),
    narrativeField('intro', 'Introduction'),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [{ type: 'pageSection' }],
    }),
  ],
  preview: { select: { title: 'key' } },
});

export const legalClause = defineType({
  name: 'legalClause',
  title: 'Clause',
  type: 'object',
  fields: [
    requiredString('heading', 'Heading'),
    interpretationField('text', 'Text (supplied by the company)'),
  ],
});

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Page',
      type: 'string',
      options: { list: ['disclaimer', 'privacy', 'terms'] },
      validation: (rule) => rule.required(),
    }),
    fact('lastUpdated', 'factDate', 'Last updated'),
    defineField({
      name: 'clauses',
      title: 'Clauses',
      type: 'array',
      of: [{ type: 'legalClause' }],
    }),
    defineField({
      name: 'clausesBrief',
      title: 'INPUT NEEDED brief (while no text is supplied)',
      type: 'string',
    }),
    recordStatus,
    ...approvalFields,
  ],
  preview: { select: { title: 'key' } },
});
