import type { APIRoute } from 'astro';
import { config } from '~/lib/config';
import { robotsTxt } from '~/lib/seo';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('`site` must be set in astro.config.ts.');
  return new Response(robotsTxt(config.contentMode, site), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
