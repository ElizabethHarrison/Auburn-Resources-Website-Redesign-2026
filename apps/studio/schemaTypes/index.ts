import { provenanceTypes } from './objects/provenance';
import { documentRecord, keyFacts, person, siteSettings } from './documents/company';
import {
  milestone,
  project,
  projectSetting,
  prospect,
  resourceEstimate,
  result,
  workItem,
} from './documents/projects';
import { figure, photo } from './documents/media';
import {
  article,
  homePage,
  legalClause,
  legalPage,
  page,
  pageSection,
  portfolioPage,
} from './documents/pages';

export const schemaTypes = [
  ...provenanceTypes,
  keyFacts,
  projectSetting,
  pageSection,
  legalClause,
  siteSettings,
  person,
  documentRecord,
  project,
  prospect,
  resourceEstimate,
  result,
  milestone,
  workItem,
  figure,
  photo,
  article,
  homePage,
  portfolioPage,
  page,
  legalPage,
];
