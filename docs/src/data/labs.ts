/**
 * Catalogue of hands-on labs shown on the /labs page.
 *
 * This file is the single place to add, reorder or retire a lab. Nothing on
 * the page is derived from Instruqt at build time: every lab listed here is a
 * deliberate curation decision.
 *
 * How to add a lab:
 *   1. Create a named invite for the lab in Instruqt (Manage > track > Invites)
 *      so launches from this page are attributed separately from the docs and
 *      opsmill.com. Paste it into `inviteUrl`. Until an invite exists the
 *      public `trackUrl` is used as a fallback.
 *   2. Add an entry to `labs` below.
 *   3. Reference its `id` from a track's `labIds` in order, or add the id to
 *      `miscLabIds` or `thirdPartyLabIds`.
 *
 * How to retire a lab: set `status: 'retired'`. The card disappears and any
 * track that referenced it renumbers without a gap. Do not delete the entry
 * straight away, so the reason and the old links stay in history.
 */

export type LabLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type LabStatus = 'active' | 'retired';

export type LabOwner = {
  /** Person or organisation that authored and supports the lab. */
  name: string;
  /** Optional link to the owner's site or profile. */
  url?: string;
};

export type Lab = {
  /** Stable identifier referenced by tracks and sections. */
  id: string;
  /** Card title. Uses the docs name where a detail page exists. */
  title: string;
  /** One sentence. The Instruqt track page carries the long version. */
  description: string;
  /** Approximate time to completion, in minutes. */
  durationMinutes: number;
  level: LabLevel;
  /** Public Instruqt track URL. Used when no invite has been created yet. */
  trackUrl: string;
  /** Named Instruqt invite for this page. Preferred launch target. */
  inviteUrl?: string;
  /** Detail page in the Infrahub docs, when one exists. */
  docsUrl?: string;
  /**
   * Shown on the card only when there is no docs detail page. Labs with a
   * detail page carry their prerequisites there instead.
   */
  prerequisites?: string;
  /** Set for third-party labs only. */
  owner?: LabOwner;
  status: LabStatus;
};

export type Track = {
  id: string;
  title: string;
  /** Two sentences at most: the storyline and who it is for. */
  description: string;
  /** Lab ids in learning order. */
  labIds: string[];
  /** Track-level detail page in the Infrahub docs, when one exists. */
  docsUrl?: string;
};

const INSTRUQT_TRACKS = 'https://play.instruqt.com/opsmill/tracks';

export const labs: Lab[] = [
  // --- Infrahub: Fundamentals to Expert -----------------------------------
  // Docs state ~5 hours across the five labs. Instruqt sets no per-lab
  // duration, so each is recorded as 1 hour.
  {
    id: 'orientation',
    title: 'Orientation',
    description:
      'Load a base schema, seed the OtterNet topology, and explore the data with GraphQL, infrahubctl and the Python SDK.',
    durationMinutes: 60,
    level: 'Beginner',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-orientation`,
    docsUrl: '/learn/labs/fundamentals-to-expert#1-orientation',
    status: 'active',
  },
  {
    id: 'schema-modeling',
    title: 'Schema Modeling',
    description:
      'Design a site-design hierarchy, add custom generics and nodes, and extend existing node types with new attributes and relationships.',
    durationMinutes: 60,
    level: 'Beginner',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-schema-modeling`,
    docsUrl: '/learn/labs/fundamentals-to-expert#2-schema-modeling',
    status: 'active',
  },
  {
    id: 'enforcement-validation',
    title: 'Enforcement and Validation',
    description:
      'See how schema constraints, branch isolation, proposed changes, Python checks and profiles keep data quality high.',
    durationMinutes: 60,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-enforcement`,
    docsUrl: '/learn/labs/fundamentals-to-expert#3-enforcement--validation',
    status: 'active',
  },
  {
    id: 'design-driven-generator',
    title: 'Design-Driven Generator',
    description:
      'Write and run a Generator that provisions the Munich site, allocating devices, ASNs and management IPs from the source of truth.',
    durationMinutes: 60,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-generator`,
    docsUrl: '/learn/labs/fundamentals-to-expert#4-design-driven-generator',
    status: 'active',
  },
  {
    id: 'transforms-config-rendering',
    title: 'Transforms and Config Rendering',
    description:
      'Render a deployable router configuration from a Jinja2 Transform, pulling every value from the source of truth.',
    durationMinutes: 60,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-transforms`,
    docsUrl: '/learn/labs/fundamentals-to-expert#5-transformations--configuration-rendering',
    status: 'active',
  },

  // --- Infrahub Essentials ------------------------------------------------
  // Card titles follow the docs. Instruqt titles differ (Infrahub getting
  // started, Infrahub schema introduction, Infrahub artifact introduction).
  // Durations follow Instruqt where it sets one.
  {
    id: 'first-tour',
    title: 'First Tour of Infrahub',
    description:
      'A guided overview of branching, the flexible schema and unified storage, to see what Infrahub does and whether it fits your needs.',
    durationMinutes: 60,
    level: 'Beginner',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-getting-started`,
    docsUrl: '/learn/labs/infrahub-introduction',
    status: 'active',
  },
  {
    id: 'schema-deep-dive',
    title: 'Schema Deep Dive',
    description:
      'Consume the schema library, create your own schema, and safely extend one that is already in use.',
    durationMinutes: 120,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-schema-introduction`,
    docsUrl: '/learn/labs/schema-deep-dive',
    status: 'active',
  },
  {
    id: 'deploy-first-configuration',
    title: 'Deploy Your First Configuration',
    description:
      'Build a GraphQL query and a Jinja2 template, connect a Git repository, and generate a real device configuration as an artifact.',
    durationMinutes: 60,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-artifact-introduction`,
    docsUrl: '/learn/labs/deploy-first-configuration',
    status: 'active',
  },

  // --- AutoCon3 workshop (OpsMill) ----------------------------------------
  // Instruqt sets no duration for these. Values are estimates from the
  // challenge count and should be corrected by whoever ran the workshop.
  {
    id: 'schema-languages-databases',
    title: 'Schema Languages and Databases in Practice',
    description:
      'Compare JSON Schema, GraphQL and Pydantic, then see how the same data lives in SQLite and Neo4j.',
    durationMinutes: 90,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/workshop-b2-lab1`,
    prerequisites: 'No Infrahub experience required. Basic Python and SQL help.',
    status: 'active',
  },
  {
    id: 'network-modeling-with-infrahub',
    title: 'Network Infrastructure Modeling with Infrahub',
    description:
      'Model a network in Infrahub using a strict combination of role, status and kind, and weigh the benefits and costs of that approach.',
    durationMinutes: 60,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/workshop-b2-lab2`,
    prerequisites: 'Complete Schema Languages and Databases in Practice first.',
    status: 'active',
  },

  // --- Third-party labs hosted by OpsMill ---------------------------------
  // Instruqt sets no duration for these. Values are estimates.
  {
    id: 'ibm-low-code-orchestration',
    title: 'Low-Code Network Orchestration with IBM',
    description:
      'Build low-code workflows with IBM Rapid Infrastructure Automation that open a branch and change request in Infrahub, approve it, and deploy to Arista routers.',
    durationMinutes: 90,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/workshop-d4-lab1`,
    prerequisites: 'Familiarity with network automation concepts. No IBM product experience required.',
    owner: { name: 'IBM' },
    status: 'active',
  },
  {
    id: 'network-testing-nuts',
    title: 'Network Testing with NUTS',
    description:
      'Use Infrahub as the source for Network Unit Testing System tests, run them against a containerlab network, and visualise results in Grafana.',
    durationMinutes: 60,
    level: 'Intermediate',
    trackUrl: `${INSTRUQT_TRACKS}/urs-workshop-ac3`,
    prerequisites: 'Basic Infrahub knowledge. Familiarity with containerlab and Prometheus helps.',
    owner: { name: 'Urs Baumann and Steinn Bjarnarson' },
    status: 'active',
  },
  {
    id: 'modern-network-observability',
    title: 'Modern Network Observability',
    description:
      'Spend a day on call inside a full observability stack: learn PromQL and LogQL, find a broken BGP peer, build a dashboard and alert, and run an incident end to end.',
    durationMinutes: 180,
    level: 'Advanced',
    trackUrl: `${INSTRUQT_TRACKS}/modern-network-observability`,
    prerequisites: 'Comfortable on a Linux shell. No prior Prometheus, Loki or Grafana experience required.',
    owner: { name: 'Christian Adell', url: 'https://www.linkedin.com/in/christianadell/' },
    status: 'active',
  },
];

/** Tracks in the order they appear on the page. */
export const tracks: Track[] = [
  {
    id: 'fundamentals-to-expert',
    title: 'Infrahub: Fundamentals to Expert',
    description:
      'Join the network automation team at OtterNet and take a site from an empty Infrahub instance to a fully automated deployment. Five labs on one shared dataset, each building on the last.',
    labIds: [
      'orientation',
      'schema-modeling',
      'enforcement-validation',
      'design-driven-generator',
      'transforms-config-rendering',
    ],
    docsUrl: '/learn/labs/fundamentals-to-expert',
  },
  {
    id: 'infrahub-essentials',
    title: 'Infrahub Essentials',
    description:
      'A shorter path through the core concepts: tour the product, shape your first schema, then turn source-of-truth data into a device configuration.',
    labIds: ['first-tour', 'schema-deep-dive', 'deploy-first-configuration'],
  },
  {
    id: 'autocon3-workshop',
    title: 'AutoCon3 Workshop: Modeling Infrastructure Data',
    description:
      'The two labs behind the OpsMill workshop at AutoCon3 in May 2025. Start with schema languages and databases in general, then apply the ideas to a network model in Infrahub.',
    labIds: ['schema-languages-databases', 'network-modeling-with-infrahub'],
  },
];

/** OpsMill labs that do not belong to a track. The section hides when empty. */
export const miscLabIds: string[] = [];

/** Labs authored by partners and community members, hosted on OpsMill's Instruqt organisation. */
export const thirdPartyLabIds: string[] = [
  'ibm-low-code-orchestration',
  'network-testing-nuts',
  'modern-network-observability',
];
