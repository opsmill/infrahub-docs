import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  demoSidebar: [
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
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'developer-guide',
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
