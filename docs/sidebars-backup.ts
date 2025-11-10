import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  infrahubOpsSidebar: [
    'readme',
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/getting-started',
      ],
    },
    {
      type: 'category',
      label: 'How-to Guides',
      items: [
        'guides/install',
        'guides/backup-instance',
        'guides/restore-backup',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/commands',
        'reference/configuration',
      ],
    },
  ]
};

export default sidebars;
