import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The fast path first: the overview, the quick start, then the map
// from Infrahub capability to the scenario that exercises it. A visitor meets
// all three before the install page, which is the page that asks for time.
// Reference material next, then the payload and physics pages, then the two
// maps every PoP carries, then the demo guide hub with its three walkthrough
// pages under it, then the guide for people changing the repository. The
// spectral model sits directly after the link budget: one decides whether a
// wavelength closes, the other whether it fits. The optical map comes before
// the ODU map because the second one is read as a contrast with the first.
// The three walkthrough pages follow the order a presenter uses: the scenarios
// that write, the scenarios that read, then the material loaded by hand.
// Document ids are bare rather than prefixed with the section name. This file
// is copied verbatim into opsmill/infrahub-docs as sidebars-demo-otn.ts, where
// the plugin instance mounts docs-demo-otn/ at routeBasePath 'demo-otn', so the
// prefix comes from the mount point there and from routeBasePath '/' here. A
// prefix in the ids would resolve in neither place.
const sidebars: SidebarsConfig = {
  otnSidebar: [
    'overview',
    'quickstart',
    'what-this-shows',
    'installation-setup',
    'schema-reference',
    'concepts',
    'client-mapping',
    'link-budget',
    'spectral-model',
    'ai-payloads',
    'network-map',
    'odu-map',
    'demo-guide',
    'provisioning-scenarios',
    'reporting-scenarios',
    'loadable-scenarios',
    'developer-guide',
  ],
};

export default sidebars;
