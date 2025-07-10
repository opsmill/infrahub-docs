import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  servicecatalogSidebar: [
    'home',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/user-walkthrough',
        'getting-started/developer-walkthrough',
      ],
    },
  ]
};

export default sidebars;
