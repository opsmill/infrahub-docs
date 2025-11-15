import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  BundleDcSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      items: [
        'readme',
        'install',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'user-walkthrough',
        'containerlab-deployment',
        'security-management',
        'service-catalog',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'developer-guide',
        'enterprise',
      ],
    },
    {
      type: 'category',
      label: 'Topics',
      items: [
        'concepts',
      ],
    },
  ]
};

export default sidebars;
