import React, {type ReactElement} from 'react';
import { DocSearch } from '@docsearch/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { DocSearchHit } from '@docsearch/react';
import '@docsearch/css';

// Define the Algolia config type from Docusaurus theme config
interface AlgoliaConfig {
  appId: string;
  apiKey: string;
  indexName: string;
  contextualSearch?: boolean;
  externalUrlRegex?: string;
  searchParameters?: Record<string, any>;
  insights?: boolean;
  askAi?: {
    assistantId: string;
    indexName: string;
    appId: string;
    apiKey: string;
  };
}

export default function SearchBar(): ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const { algolia } = siteConfig.themeConfig as { algolia: AlgoliaConfig };

  return (
    <DocSearch
      appId={algolia.appId}
      apiKey={algolia.apiKey}
      indexName={algolia.indexName}
      insights={algolia.insights}
      askAi={algolia.askAi}
      transformItems={(items: DocSearchHit[]) => {
        return items.map((item) => {
          // Extract the pathname from the URL
          const urlPath = new URL(item.url).pathname;

          // Get the enclosing folder (second-to-last path segment)
          const pathParts = urlPath.split('/').filter(part => part !== '');
          const enclosingFolder = pathParts.length > 1
            ? pathParts[pathParts.length - 2]
            : pathParts[0] || 'root';

          // Format folder name nicely
          const folderDisplay = enclosingFolder
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

          // Build the new lvl0 with path info
          const newLvl0 = item.hierarchy.lvl0
            ? `${item.hierarchy.lvl0} › ${folderDisplay}`
            : folderDisplay;

          // Update both hierarchy and _highlightResult (which is what displays in UI)
          const transformedItem = {
            ...item,
            hierarchy: {
              ...item.hierarchy,
              lvl0: newLvl0,
            },
            _highlightResult: {
              ...item._highlightResult,
              hierarchy: {
                ...item._highlightResult?.hierarchy,
                lvl0: {
                  ...item._highlightResult?.hierarchy?.lvl0,
                  value: newLvl0,
                },
              },
            },
          };

          return transformedItem;
        });
      }}
    />
  );
}
