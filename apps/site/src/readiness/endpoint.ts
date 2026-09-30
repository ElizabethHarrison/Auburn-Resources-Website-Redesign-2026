/**
 * `/_readiness.json`: the launch-readiness data for this build's content (D-019, D-026; docs/LAUNCH-READINESS.md).
 * Built in every mode and moved out of the output directory by the `auburn:readiness` integration, so it is never
 * deployed.
 */
import type { APIRoute } from 'astro';
import { content } from '../lib/content';
import { toBrisbaneDate } from '../lib/dates';
import { buildReadinessReport } from '../lib/readiness';

export const GET: APIRoute = async () =>
  new Response(
    JSON.stringify(await buildReadinessReport(content, toBrisbaneDate(new Date())), null, 2),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
