import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  aristaAvdSidebar: [
    'home',
    'quick-start',
    'provision-first-fabric',
    'viewing-artifacts',
    'cloudvision',
    'containerlab',
    'troubleshooting',
    'supported-capabilities',
    {
      type: 'category',
      label: 'How-to Guides',
      collapsed: false,
      items: [
        'how-to/add-network-segment',
        'how-to/add-server',
        'how-to/create-tenant',
        'how-to/regenerate-fabric',
        'how-to/upgrade-avd-version',
      ],
    },
    {
      type: 'category',
      label: 'Developer Guide',
      collapsed: false,
      link: { type: 'doc', id: 'developer-guide/index' },
      items: [
        'developer-guide/architecture',
        'developer-guide/schemas',
        'developer-guide/generators',
        'developer-guide/transforms',
        'developer-guide/checks',
        'developer-guide/concepts',
        {
          type: 'category',
          label: 'AVD Pipeline',
          collapsed: false,
          items: [
            'developer-guide/avd/overview',
            'developer-guide/avd/hostvars',
            'developer-guide/avd/transforms',
            'developer-guide/avd/artifacts',
            'developer-guide/avd/role-mapping',
            'developer-guide/avd/extending',
            'developer-guide/avd/debugging',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
