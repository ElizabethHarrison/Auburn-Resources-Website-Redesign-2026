/**
 * Reads design tokens from tokens.css so tests and the catalogue use the stylesheet as the single
 * source of truth (no hex values duplicated in TypeScript).
 */

export interface Token {
  readonly name: string;
  /** The declared value with comments removed, e.g. `#1b3a5c` or `var(--ink-survey)`. */
  readonly value: string;
  /** `A` approved, `D` derived, or undefined when untagged (aliases inherit their target's tag). */
  readonly tag?: 'A' | 'D';
}

const DECLARATION = /(--[\w-]+)\s*:\s*([^;]+);[^\S\n]*(?:\/\*\s*\[(A|D)\][^*]*\*\/)?/g;

/** Custom properties declared in the first `:root` block (the reduced-motion overrides are ignored). */
export function parseTokens(css: string): Token[] {
  const start = css.indexOf(':root');
  const end = css.indexOf('\n}', start);
  const block = css.slice(start, end).replace(/\/\*(?!\s*\[[AD]\])[\s\S]*?\*\//g, '');
  return [...block.matchAll(DECLARATION)].map(([, name = '', value = '', tag]) => ({
    name,
    value: value.replace(/\s+/g, ' ').trim(),
    ...(tag === 'A' || tag === 'D' ? { tag } : {}),
  }));
}

/** Resolve `var(--x)` chains to a literal hex colour, or undefined if the token is not a colour. */
export function resolveColour(
  tokens: readonly Token[],
  name: string,
  depth = 0,
): string | undefined {
  if (depth > 10) throw new Error(`Token cycle at ${name}`);
  const token = tokens.find((candidate) => candidate.name === name);
  if (!token) return undefined;
  const reference = /^var\((--[\w-]+)\)$/.exec(token.value);
  if (reference?.[1]) return resolveColour(tokens, reference[1], depth + 1);
  return /^#[0-9a-f]{6}$/i.test(token.value) ? token.value.toLowerCase() : undefined;
}
