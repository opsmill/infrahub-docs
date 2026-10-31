import React, { type ReactNode } from 'react';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import type { Props as DefaultNavbarItemProps } from '@theme/NavbarItem/DefaultNavbarItem';

const GITHUB_ORG_URL = 'https://github.com/opsmill';
const DEFAULT_REPO = 'infrahub';

// Maps each docs plugin ID (see docusaurus.config.ts) to the GitHub repository
// its content is synced from. Sections not listed here, and pages outside any
// docs plugin, fall back to DEFAULT_REPO.
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
  'docs-infrahub-solution-ai-dc': 'infrahub-solution-ai-dc',
  'docs-arista-avd': 'infrahub-arista-avd',
  'docs-infrahub-demo-sp': 'infrahub-demo-sp',
  'docs-demo-otn': 'infrahub-demo-otn',
};

type Props = Omit<DefaultNavbarItemProps, 'href' | 'to'>;

export default function GitHubRepoNavbarItem(props: Props): ReactNode {
  const activePlugin = useActivePlugin({ failfast: false });
  const repo = (activePlugin && REPO_BY_PLUGIN_ID[activePlugin.pluginId]) ?? DEFAULT_REPO;
  return <DefaultNavbarItem {...props} href={`${GITHUB_ORG_URL}/${repo}`} />;
}
