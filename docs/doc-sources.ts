/**
 * Where the content of each docs section lives on GitHub.
 *
 * Used by docusaurus.config.ts for each section's "Edit this page" link, and by
 * src/components/GitHubRepoNavbarItem.tsx for the header GitHub icon. Add an
 * entry for every new docs section. The key is the docs plugin ID.
 *
 * Plain TypeScript with no imports, so both the Node config and the browser
 * bundle can load it.
 */

export type DocSource = {
  /** Repository name in the opsmill GitHub organization. */
  repo: string;
  /** Branch the sync workflow copies from. */
  branch: string;
  /** Folder in the repository that holds the section's pages. */
  contentDir: string;
};

export const GITHUB_ORG_URL = 'https://github.com/opsmill';

/** Repository that holds this site's own source. */
export const SITE_REPO = 'infrahub-docs';

export const DOC_SOURCES: Record<string, DocSource> = {
  default: { repo: 'infrahub', branch: 'stable', contentDir: 'docs/docs' },
  'docs-python-sdk': { repo: 'infrahub-sdk-python', branch: 'stable', contentDir: 'docs/docs/python-sdk' },
  infrahubctl: { repo: 'infrahub-sdk-python', branch: 'stable', contentDir: 'docs/docs/infrahubctl' },
  'docs-emma': { repo: 'emma', branch: 'main', contentDir: 'docs/docs' },
  'docs-vscode': { repo: 'infrahub-vscode', branch: 'main', contentDir: 'docs/docs' },
  'docs-mcp': { repo: 'infrahub-mcp', branch: 'stable', contentDir: 'docs/docs' },
  'docs-ai-skills': { repo: 'infrahub-skills', branch: 'main', contentDir: 'docs/docs' },
  'docs-backup': { repo: 'infrahub-backup', branch: 'main', contentDir: 'docs/docs' },
  'docs-integrations': { repo: SITE_REPO, branch: 'main', contentDir: 'docs/docs-integrations' },
  'docs-ansible': { repo: 'infrahub-ansible', branch: 'stable', contentDir: 'docs/docs' },
  'docs-exporter': { repo: 'infrahub-exporter', branch: 'main', contentDir: 'docs/docs' },
  'docs-sync': { repo: 'infrahub-sync', branch: 'main', contentDir: 'docs/docs' },
  'docs-nornir': { repo: 'nornir-infrahub', branch: 'stable', contentDir: 'docs/docs' },
  'docs-schema-library': { repo: 'schema-library', branch: 'main', contentDir: 'docs/docs' },
  'docs-demo-dc': { repo: 'infrahub-demo-dc', branch: 'main', contentDir: 'docs/docs' },
  'docs-infrahub-demo-sp': { repo: 'infrahub-demo-sp', branch: 'main', contentDir: 'docs/docs' },
  'docs-demo-otn': { repo: 'infrahub-demo-otn', branch: 'main', contentDir: 'docs/docs' },
  'docs-service-catalog': { repo: 'infrahub-demo-service-catalog', branch: 'main', contentDir: 'docs/docs' },
  'docs-infrahub-solution-ai-dc': { repo: 'infrahub-solution-ai-dc', branch: 'main', contentDir: 'docs/docs' },
  'docs-arista-avd': { repo: 'infrahub-arista-avd', branch: 'main', contentDir: 'docs/docs' },
};

/**
 * Returns an editUrl function that opens a page's source file on GitHub.
 *
 * A string editUrl does not work for synced sections: Docusaurus appends the
 * file's path in this repository (for example docs-sync/guides/x.mdx), which
 * does not exist in the source repository. docPath is the file's path inside
 * the section, so it matches the layout under contentDir.
 */
export function editUrlFor(pluginId: string): ({ docPath }: { docPath: string }) => string {
  const source = DOC_SOURCES[pluginId];
  if (!source) {
    throw new Error(`No entry for docs plugin "${pluginId}" in docs/doc-sources.ts`);
  }
  return ({ docPath }) =>
    `${GITHUB_ORG_URL}/${source.repo}/edit/${source.branch}/${source.contentDir}/${docPath}`;
}
