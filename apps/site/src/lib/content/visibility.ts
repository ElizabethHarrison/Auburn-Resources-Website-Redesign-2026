/**
 * Record-level visibility: whether a whole record (a register row, a person card, a project card) may
 * appear in a given mode. Built on the slot rules in lib/facts.ts — records are hidden, never
 * half-shown, in production.
 */
import { isRenderable, isStatusRenderable, type ContentMode } from '../facts';
import type { DocumentRecord, Person, Project } from './types';

/**
 * A document appears in a register when it is public, the record is renderable, and — in production —
 * its release date and file are approved. Preview shows every public record, with placeholders.
 */
export function isDocumentListable(document: DocumentRecord, mode: ContentMode): boolean {
  if (document.internal) return false;
  if (!isStatusRenderable(document.status, mode)) return false;
  if (mode === 'preview') return true;
  return isRenderable(document.releaseAt, mode) && isRenderable(document.file, mode);
}

/** A person card needs at least an approved role in production; the bio may drop on its own. */
export function isPersonListable(person: Person, mode: ContentMode): boolean {
  return mode === 'preview' || isRenderable(person.role, mode);
}

/**
 * A project may be listed (cards, menus, footer) only when it is confirmed as held. Until the verified
 * project list exists (docs/OPEN-QUESTIONS.md Q-20), no project is listable in production.
 */
export function isProjectListable(project: Project, mode: ContentMode): boolean {
  if (mode === 'preview') return true;
  const { holding } = project;
  return holding.kind === 'fact' && isRenderable(holding, mode) && holding.value !== 'noLongerHeld';
}
