import React, { type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useActiveDocContext, useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import type { Props as DefaultNavbarItemProps } from '@theme/NavbarItem/DefaultNavbarItem';
import { DOC_SOURCES, GITHUB_ORG_URL, SITE_REPO } from '@site/doc-sources';

// Used for a docs plugin that has no entry in docs/doc-sources.ts.
const DEFAULT_REPO = 'infrahub';

type Props = Omit<DefaultNavbarItemProps, 'href' | 'to'>;

/**
 * Header GitHub link that points to the repository behind the current page.
 *
 * - The landing page links to SITE_REPO. Its text is synced from opsmill/infrahub,
 *   but its layout components are maintained in this repository.
 * - Docs pages link to the repository listed for their plugin ID in
 *   docs/doc-sources.ts.
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
    repo = DOC_SOURCES[activePlugin.pluginId]?.repo ?? DEFAULT_REPO;
  } else {
    repo = SITE_REPO;
  }

  return <DefaultNavbarItem {...props} href={`${GITHUB_ORG_URL}/${repo}`} />;
}
