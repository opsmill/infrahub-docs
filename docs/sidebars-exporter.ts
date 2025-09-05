import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  exporterSidebar: [
    'readme',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/configuration',
        'guides/installation',
      ],
    },
  ]
};

export default sidebars;
