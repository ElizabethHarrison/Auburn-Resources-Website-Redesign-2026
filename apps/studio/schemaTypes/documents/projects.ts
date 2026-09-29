/** Projects and their records (docs/SITEMAP.md §8; dossier modules 01–09). */
import { defineField, defineType } from 'sanity';
import { narrativeIssue, heldBackIssue } from '../../validation/rules';
import {
  approvalFields,
  fact,
  orderField,
  interpretationField,
  projectRef,
  recordStatus,
  requiredString,
} from '../fields';

export const projectSetting = defineType({
  name: 'projectSetting',
  title: 'Setting',
  type: 'object',
  fields: [
    fact('neighbouringDeposits', 'factString', 'Neighbouring deposits'),
    fact('nearestTown', 'factString', 'Nearest town'),
    fact('access', 'factString', 'Access'),
    fact('infrastructure', 'factString', 'Infrastructure'),
    fact(
      'traditionalOwners',
      'factString',
      'Traditional Owners',
      'Name groups only with their recorded consent.',
    ),
  ],
});

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    orderField,
    requiredString('name', 'Name'),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sheetNumber',
      title: 'Sheet number',
      type: 'string',
      validation: (rule) => rule.required().regex(/^02\.\d+$/, { name: 'sheet' }),
    }),
    fact('holding', 'factHolding', 'Holding'),
    fact('state', 'factState', 'State'),
    fact('commodities', 'factCommodities', 'Commodities'),
    fact('stage', 'factStage', 'Stage'),
    fact('areaKm2', 'factNumber', 'Area (km²)'),
    fact('ownership', 'factOwnership', 'Ownership'),
    defineField({
      name: 'heroThesis',
      title: 'Hero thesis (≤120 characters, no digits)',
      type: 'narrative',
      validation: (rule) =>
        rule.custom((value: { text?: string } | undefined) => narrativeIssue(value?.text, 120)),
    }),
    interpretationField('geologySummary', 'Geology summary (≤120 words, competent person)'),
    defineField({
      name: 'statements',
      title: 'Technical statements',
      type: 'array',
      of: [{ type: 'interpretation' }],
    }),
    fact('tenements', 'factString', 'Tenements'),
    fact('asAt', 'factDate', 'Page as at'),
    defineField({ name: 'setting', title: 'Setting (module 01)', type: 'projectSetting' }),
    defineField({ name: 'heroPhoto', title: 'Hero photograph', type: 'photoSlot' }),
    defineField({ name: 'settingMap', title: 'Setting map (Fig. 1)', type: 'figureSlot' }),
    defineField({ name: 'sectionFigure', title: 'Cross-section (Fig. 2)', type: 'figureSlot' }),
    defineField({
      name: 'photos',
      title: 'Photographs',
      type: 'array',
      of: [{ type: 'photoSlot' }],
    }),
    interpretationField('cpStatement', 'Competent person statement'),
    defineField({
      name: 'heldBackNote',
      title: 'Held-back note (internal)',
      description:
        'Records only that wording is held back. Never store the held-back wording itself.',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.custom((value: string | undefined) => heldBackIssue(value)),
    }),
    defineField({ name: 'legacyPath', title: 'Old-site path (redirects only)', type: 'string' }),
  ],
});

export const prospect = defineType({
  name: 'prospect',
  title: 'Target / prospect',
  type: 'document',
  fields: [
    orderField,
    projectRef,
    requiredString('name', 'Name'),
    interpretationField('summary', 'Summary'),
    fact('targetType', 'factString', 'Target type'),
  ],
});

export const resourceEstimate = defineType({
  name: 'resourceEstimate',
  title: 'Mineral Resource (JORC 2012)',
  type: 'document',
  fields: [
    orderField,
    projectRef,
    fact('category', 'factString', 'Category'),
    fact('tonnesMt', 'factNumber', 'Tonnes (Mt)'),
    fact('grades', 'factString', 'Grades'),
    fact('containedMetal', 'factString', 'Contained metal'),
    fact('cutOff', 'factString', 'Cut-off'),
    fact('estimateDate', 'factDate', 'Estimate date'),
  ],
});

export const result = defineType({
  name: 'result',
  title: 'Result',
  type: 'document',
  fields: [
    orderField,
    projectRef,
    fact('headline', 'factString', 'Headline (exactly as reported)'),
    fact('holeOrSurveyId', 'factString', 'Hole or survey'),
    requiredString('prospectName', 'Prospect'),
    defineField({
      name: 'reportedIn',
      title: 'Reported in',
      type: 'reference',
      to: [{ type: 'documentRecord' }],
      validation: (rule) => rule.required(),
    }),
  ],
});

export const milestone = defineType({
  name: 'milestone',
  title: 'Milestone',
  type: 'document',
  fields: [
    orderField,
    projectRef,
    requiredString('title', 'Title'),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      options: { list: ['done', 'next', 'planned'] },
      validation: (rule) => rule.required(),
    }),
    fact('when', 'factString', 'When'),
    recordStatus,
    ...approvalFields,
  ],
});

export const workItem = defineType({
  name: 'workItem',
  title: 'Exploration work',
  type: 'document',
  fields: [
    orderField,
    projectRef,
    requiredString('method', 'Method'),
    fact('quantity', 'factNumber', 'Quantity'),
    fact('year', 'factNumber', 'Year'),
    fact('operator', 'factOperator', 'Operator'),
  ],
});
