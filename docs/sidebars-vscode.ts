import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  vscodeSidebar: [
    'index',
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: false,
      items: [
        'tutorials/getting-started',
      ],
    },
    {
      type: 'category',
      label: 'How-to Guides',
      collapsed: false,
      items: [
        'guides/configure-multiple-servers',
        'guides/execute-graphql-queries',
        'guides/manage-branches',
        'guides/snippets',
      ],
    },
    {
      type: 'category',
      label: 'Topics',
      collapsed: false,
      items: [
        'topics/extension-architecture',
        'topics/schema-validation',
        'topics/security-configuration',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'reference/commands-settings',
      ],
    },
  ]
};

export default sidebars;
