/**
 * NDJSON snapshot loader (`CONTENT_SOURCE=sanity-export`, D-024 §8): the format `sanity dataset export` produces.
 * Lets the whole Sanity mapping and integrity pipeline run with no network and no credentials.
 */
import { readFile } from 'node:fs/promises';
import type { RawDocument } from './perspective';

export function parseNdjson(text: string): RawDocument[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const value: unknown = JSON.parse(line);
      if (
        typeof value !== 'object' ||
        value === null ||
        typeof (value as RawDocument)._id !== 'string' ||
        typeof (value as RawDocument)._type !== 'string'
      ) {
        throw new Error(`NDJSON line ${index + 1} is not a Sanity document`);
      }
      return value as RawDocument;
    });
}

export function toNdjson(documents: readonly RawDocument[]): string {
  return documents.map((document) => JSON.stringify(document)).join('\n') + '\n';
}

export const snapshotLoader = (path: string) => async (): Promise<RawDocument[]> =>
  parseNdjson(await readFile(path, 'utf8'));
