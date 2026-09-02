import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Six groups, in the order a reader meets them. The overview, the quick start
// and the map from Infrahub capability to scenario come first, so a visitor
// meets all three before the install page, which is the page that asks for
// time. Reference material next, then the payload and physics pages, then the
// two maps every PoP carries, then the demo guide with its three walkthrough
// pages under it, then the guide for people changing the repository. The
// spectral model sits directly after the link budget: one decides whether a
// wavelength closes, the other whether it fits. The optical map comes before
// the ODU map because the second one is read as a contrast with the first.
// The three walkthrough pages follow the order a presenter uses: the scenarios
// that write, the scenarios that read, then the material loaded by hand.
//
// Demo guide is a category with a link rather than a plain entry, because the
// page is a hub: it opens with a table of the nine scenarios and then hands
// off to the three pages nested beneath it.
//
// Neither collapsed nor collapsible is set anywhere here. Both sites that
// render this file decide that themselves, and infrahub-docs sets
// sidebarCollapsed on the plugin instance.
//
// Document ids are bare rather than prefixed with the section name. This file
// is copied verbatim into opsmill/infrahub-docs as sidebars-demo-otn.ts, where
// the plugin instance mounts docs-demo-otn/ at routeBasePath 'demo-otn', so the
// prefix comes from the mount point there and from routeBasePath '/' here. A
// prefix in the ids would resolve in neither place.
const sidebars: SidebarsConfig = {
  otnSidebar: [
    {
      type: 'category',
      label: 'Getting started',
      items: [
        'overview',
        'quickstart',
        'what-this-shows',
        'installation-setup',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'schema-reference',
        'concepts',
        'client-mapping',
      ],
    },
    {
      type: 'category',
      label: 'Optical engineering',
      items: [
        'link-budget',
        'spectral-model',
        'ai-payloads',
      ],
    },
    {
      type: 'category',
      label: 'Maps',
      items: [
        'network-map',
        'odu-map',
      ],
    },
    {
      type: 'category',
      label: 'Demo guide',
      link: {
        type: 'doc',
        id: 'demo-guide',
      },
      items: [
        'provisioning-scenarios',
        'reporting-scenarios',
        'loadable-scenarios',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'developer-guide',
      ],
    },
  ],
};

export default sidebars;
