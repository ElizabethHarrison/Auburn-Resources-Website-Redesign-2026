/** The Studio reads only these environment variables (docs/ENV.md); no Node type package is needed for that. */
declare const process: { readonly env: Readonly<Record<string, string | undefined>> };
