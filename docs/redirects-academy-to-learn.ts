/**
 * Redirect table for the "academy" → "learn" section rename.
 *
 * The Academy section was renamed to "Learn" and its getting-started pages
 * were folded into learn/labs/. All paths are relative to the site root
 * (no /docs/ prefix), matching the production Docusaurus setup:
 * routeBasePath "/" and baseUrl "/".
 *
 * Usage in docusaurus.config.ts:
 *
 *   import { redirects_academy_to_learn } from './redirects-academy-to-learn';
 *   // ...
 *   plugins: [
 *     ['@docusaurus/plugin-client-redirects', { redirects: [...redirects_academy_to_learn] }],
 *   ],
 */

type Redirect = { from: string | string[]; to: string };

export const redirects_academy_to_learn: Redirect[] = [
  // "academy" section renamed to "learn"; getting-started pages folded into labs/
  { to: '/learn/labs/deploy-first-configuration', from: '/academy/getting-started/deploy-first-configuration' },
  { to: '/learn/labs/infrahub-introduction', from: '/academy/getting-started/infrahub-introduction' },
  { to: '/learn/tutorials/build-a-check', from: '/academy/tutorials/build-a-check' },
  { to: '/learn/tutorials/build-your-first-schema', from: '/academy/tutorials/build-your-first-schema' },
  { to: '/learn/tutorials/groups', from: '/academy/tutorials/groups' },
  { to: '/learn/tutorials/generators/build-chained-generators', from: '/academy/tutorials/generators/build-chained-generators' },
  { to: '/learn/tutorials/generators/build-your-first-generator', from: '/academy/tutorials/generators/build-your-first-generator' },
  { to: '/learn/tutorials/transformations/build-a-jinja2-transformation', from: '/academy/tutorials/transformations/build-a-jinja2-transformation' },
  { to: '/learn/tutorials/transformations/build-a-python-transformation', from: '/academy/tutorials/transformations/build-a-python-transformation' },
  // old Academy landing page, removed; closest current equivalent
  { to: '/learn/labs/overview', from: '/academy/academy' },
];
