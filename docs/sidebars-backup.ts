import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  infrahubOpsSidebar: [
    'readme',
    {
      type: 'category',
      label: 'Get started',
      items: [
        'tutorials/getting-started',
      ],
    },
    {
      type: 'category',
      label: 'Infrahub Backup',
      link: {type: 'doc', id: 'backup/index'},
      items: [
        'backup/install',
        'backup/create',
        'backup/restore',
        'backup/kubernetes-backup',
        'backup/kubernetes-restore',
      ],
    },
    {
      type: 'category',
      label: 'Infrahub Collect',
      link: {type: 'doc', id: 'collect/index'},
      items: [
        'collect/install',
        'collect/create',
      ],
    },
    'self-update',
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
