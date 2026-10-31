import React, { type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useActiveDocContext, useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import type { Props as DefaultNavbarItemProps } from '@theme/NavbarItem/DefaultNavbarItem';

const GITHUB_ORG_URL = 'https://github.com/opsmill';

// Repository that holds this site's own source: Docusaurus configuration,
// standalone pages such as /labs, and the landing page components.
const SITE_REPO = 'infrahub-docs';

// Used for a docs plugin that is missing from REPO_BY_PLUGIN_ID.
const DEFAULT_REPO = 'infrahub';

// Maps each docs plugin ID (see docusaurus.config.ts) to the GitHub repository
// that holds its content. Add an entry for every new docs section.
const REPO_BY_PLUGIN_ID: Record<string, string> = {
  default: 'infrahub',
  'docs-demo-dc': 'infrahub-demo-dc',
  'docs-emma': 'emma',
  'docs-vscode': 'infrahub-vscode',
  'docs-nornir': 'nornir-infrahub',
  'docs-sync': 'infrahub-sync',
  'docs-ansible': 'infrahub-ansible',
  'docs-schema-library': 'schema-library',
  'docs-python-sdk': 'infrahub-sdk-python',
  infrahubctl: 'infrahub-sdk-python',
  'docs-service-catalog': 'infrahub-demo-service-catalog',
  'docs-exporter': 'infrahub-exporter',
  'docs-mcp': 'infrahub-mcp',
  'docs-ai-skills': 'infrahub-skills',
  'docs-backup': 'infrahub-backup',
  'docs-integrations': SITE_REPO,
  'docs-infrahub-solution-ai-dc': 'infrahub-solution-ai-dc',
  'docs-arista-avd': 'infrahub-arista-avd',
  'docs-infrahub-demo-sp': 'infrahub-demo-sp',
  'docs-demo-otn': 'infrahub-demo-otn',
};

type Props = Omit<DefaultNavbarItemProps, 'href' | 'to'>;

/**
 * Header GitHub link that points to the repository behind the current page.
 *
 * - The landing page links to SITE_REPO. Its text is synced from opsmill/infrahub,
 *   but its layout components are maintained in this repository.
 * - Docs pages link to the repository mapped to their plugin ID.
 * - Other pages, such as /labs and the 404 page, link to SITE_REPO. The core docs
 *   plugin is mounted at /, so useActivePlugin() matches these pages too; checking
 *   for an active doc tells them apart from real docs pages.
 */
export default function GitHubRepoNavbarItem(props: Props): ReactNode {
  const { pathname } = useLocation();
  const homePath = useBaseUrl('/');
  const activePlugin = useActivePlugin({ failfast: false });
  const { activeDoc } = useActiveDocContext(activePlugin?.pluginId);

  let repo: string;
  if (pathname === homePath) {
    repo = SITE_REPO;
  } else if (activePlugin && activeDoc) {
    repo = REPO_BY_PLUGIN_ID[activePlugin.pluginId] ?? DEFAULT_REPO;
  } else {
    repo = SITE_REPO;
  }

  return <DefaultNavbarItem {...props} href={`${GITHUB_ORG_URL}/${repo}`} />;
}
