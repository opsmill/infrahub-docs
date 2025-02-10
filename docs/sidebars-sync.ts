import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  syncSidebar: [
    'readme',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/installation',
        'guides/creation',
        'guides/run',
      ],
    },
    {
      type: 'category',
      label: 'Adapters',
      items: [
        'adapters/ipfabric',
        'adapters/slurpit',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/config',
        'reference/cli',
      ],
    },
  ]
};

export default sidebars;
