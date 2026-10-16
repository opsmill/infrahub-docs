import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  servicecatalogSidebar: [
    'home',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/user-walkthrough',
        'getting-started/developer-walkthrough',
      ],
    },
    {
      type: 'category',
      label: 'Business impact',
      collapsed: false,
      link: { type: 'doc', id: 'business-impact/overview' },
      items: [
        'business-impact/plan-maintenance',
        'business-impact/find-single-points-of-failure',
        'business-impact/notify-gold-customers',
        'business-impact/cost-of-service',
      ],
    },
  ]
};

export default sidebars;
