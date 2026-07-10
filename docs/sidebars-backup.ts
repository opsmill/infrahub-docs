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
        {
          type: 'category',
          label: 'Infrahub Backup',
          items: [
            'guides/install',
            'guides/backup-instance',
            'guides/restore-backup',
            'guides/kubernetes-backup',
            'guides/kubernetes-restore',
          ],
        },
        {
          type: 'category',
          label: 'Infrahub Collect',
          items: [
            'guides/install-collect',
            'guides/collect-troubleshooting-bundle',
          ],
        },
        'guides/self-update',
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
