import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  PythonSdkSidebar: [
    {
      type: 'category',
      label: 'Python SDK',
      link: {
        type: 'doc',
        id: 'python-sdk/readme'
      },
      items: [
        {
          type: 'category',
          label: 'Guides',
          items: [
            'python-sdk/guides/installation',
            'python-sdk/guides/client',
            'python-sdk/guides/query_data',
            'python-sdk/guides/create_update_delete',
            'python-sdk/guides/branches',
            'python-sdk/guides/store',
            'python-sdk/guides/tracking',
            'python-sdk/guides/batch',
            'python-sdk/guides/object-storage',
            'python-sdk/guides/resource-manager'
          ],
        },
        {
          type: 'category',
          label: 'Topics',
          items: [
            'python-sdk/topics/tracking'
          ],
        },
        {
          type: 'category',
          label: 'Reference',
          items: [
            'python-sdk/reference/config'
          ],
        },
      ],
    },
  ]
};

export default sidebars;
