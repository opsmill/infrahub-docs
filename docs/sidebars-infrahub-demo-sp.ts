import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  InfrahubDemoSpSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      items: [
        'readme',
        'quickstart',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'services/l3vpn',
        'services/sdwan',
        'lab/containerlab',
      ],
    },
    {
      type: 'category',
      label: 'Topics',
      items: [
        'architecture',
        'schema-reference',
      ],
    },
    {
      type: 'category',
      label: 'Validation',
      items: [
        'validation/batfish',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'troubleshooting',
      ],
    },
  ],
};

export default sidebars;
