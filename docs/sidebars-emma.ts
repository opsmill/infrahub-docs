import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  emmaSidebar: [
    'readme',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/configuration',
        'getting-started/first-steps',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/schema-builder',
        'features/data-import-export',
        'features/schema-management',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/building-your-first-schema',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/configuration',
        'reference/troubleshooting',
        'reference/feature-flags',
      ],
    },
  ]
};

export default sidebars;
