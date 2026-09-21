/**
 * Catalogue of hands-on labs shown on the /labs page.
 *
 * This file is the single place to add, reorder or retire a lab. Nothing on
 * the page is derived from Instruqt at build time: every lab listed here is a
 * deliberate curation decision.
 *
 * This page is the only description of a lab the docs site carries. The per-lab
 * pages that used to live under /learn/labs/ were removed once their content
 * moved into `overview` and `whatYouWillLearn` below, so keep those fields
 * substantial: a reader deciding whether to spend an hour has nothing else.
 *
 * How to add a lab:
 *   1. Create a named invite for the lab in Instruqt (Manage > track > Invites)
 *      so launches from this page are attributed separately from opsmill.com.
 *      Paste it into `inviteUrl`. Until an invite exists the public `trackUrl`
 *      is used as a fallback.
 *   2. Add an entry to `labs` below, including at least one topic so the lab
 *      can be found through the topic filter.
 *   3. Add the lab's `id` to a section in `sections`. A track lists its labs in
 *      learning order; a group is an unordered set.
 *
 * How to retire a lab: set `status: 'retired'`. The card disappears, any track
 * that referenced it renumbers without a gap, and it drops out of the filter
 * counts. Do not delete the entry straight away, so the reason and the old
 * links stay in history.
 *
 * Page order is the order of `sections`. Move a section to move it on the page.
 */

export type LabLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type LabStatus = 'active' | 'retired';

/**
 * Topics power the topic filter. Keep this list short: a topic that matches
 * every lab, or only ever one, is not worth filtering on. Add a new topic only
 * when an existing one genuinely does not describe the lab.
 */
export const TOPICS = {
  'getting-started': 'Getting started',
  'schema-modeling': 'Schema and data modeling',
  'data-quality': 'Data quality and validation',
  automation: 'Automation and workflows',
  'config-rendering': 'Configuration rendering',
  testing: 'Testing',
  observability: 'Observability',
} as const;

export type LabTopic = keyof typeof TOPICS;

export type LabOwner = {
  /** Person or organisation that authored and supports the lab. */
  name: string;
  /** Optional link to the owner's site or profile. */
  url?: string;
};

export type Lab = {
  /** Stable identifier referenced by sections. */
  id: string;
  /** Card title. */
  title: string;
  /** One sentence for the card. The long version goes in `overview`. */
  description: string;
  /** Approximate time to completion, in minutes. */
  durationMinutes: number;
  level: LabLevel;
  /** At least one. Drives the topic filter. */
  topics: LabTopic[];
  /** Public Instruqt track URL. Used when no invite has been created yet. */
  trackUrl: string;
  /** Named Instruqt invite for this page. Preferred launch target. */
  inviteUrl?: string;
  /** One or two paragraphs shown in the details dialog. */
  overview: string;
  /** Outcome bullets shown in the details dialog. */
  whatYouWillLearn: string[];
  /** What a reader needs before starting. Shown on the card and in the dialog. */
  prerequisites?: string;
  /** Set for labs OpsMill hosts but does not author. Drives the author filter. */
  owner?: LabOwner;
  status: LabStatus;
};

/** An ordered sequence of labs meant to be taken start to finish. */
export type TrackSection = {
  kind: 'track';
  id: string;
  title: string;
  /** Two sentences at most: the storyline and who it is for. */
  description: string;
  /** Lab ids in learning order. */
  labIds: string[];
  /** Shown in the track's details dialog. */
  overview: string;
  whatYouWillLearn: string[];
  prerequisites?: string;
};

/** A set of standalone labs with no prescribed order. */
export type GroupSection = {
  kind: 'group';
  id: string;
  title: string;
  description: string;
  /** Lab ids. Display order only, carries no learning order. */
  labIds: string[];
};

export type Section = TrackSection | GroupSection;

const INSTRUQT_TRACKS = 'https://play.instruqt.com/opsmill/tracks';

export const labs: Lab[] = [
  // --- Infrahub: Fundamentals to Expert -----------------------------------
  // Docs stated ~5 hours across the five labs. Instruqt sets no per-lab
  // duration, so each is recorded as 1 hour.
  {
    id: 'orientation',
    title: 'Orientation',
    description:
      'Load a base schema, seed the OtterNet topology, and explore the data with GraphQL, infrahubctl and the Python SDK.',
    durationMinutes: 60,
    level: 'Beginner',
    topics: ['getting-started', 'schema-modeling'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-orientation`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/ndncxvvluews',
    overview:
      'The entry point to the OtterNet series. Load a base schema, seed a two-site topology covering London and Amsterdam, and explore the result in the built-in GraphQL explorer. You also reach Infrahub programmatically with infrahubctl and the Python SDK, finishing with a fully populated instance ready for the labs that follow.',
    whatYouWillLearn: [
      'Load DCIM, IPAM and Location node types from the schema library using infrahubctl',
      'Seed a realistic two-site topology with devices, groups and IP addresses',
      'Explore the data with the built-in GraphQL explorer',
      'Reach the same data programmatically from the Python SDK',
    ],
    status: 'active',
  },
  {
    id: 'schema-modeling',
    title: 'Schema Modeling',
    description:
      'Design a site-design hierarchy, add custom generics and nodes, and extend existing node types with new attributes and relationships.',
    durationMinutes: 60,
    level: 'Beginner',
    topics: ['schema-modeling'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-schema-modeling`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/2w9mrgb2hiiy',
    overview:
      'OtterNet standardises its sites around reusable blueprints called Site Designs. A large campus always has two border routers, two distribution switches and four access switches, and encoding that blueprint in Infrahub is what unlocks the automated provisioning you build later in the series.',
    whatYouWillLearn: [
      'Define a generic hierarchy that captures a site design',
      'Extend the existing site node with an ASN, a design and a management subnet',
      'Build the resource pools and device templates a Generator later draws from',
      'Bring a new site, Munich, online and assign it a design',
    ],
    status: 'active',
  },
  {
    id: 'enforcement-validation',
    title: 'Enforcement and Validation',
    description:
      'See how schema constraints, branch isolation, proposed changes, Python checks and profiles keep data quality high.',
    durationMinutes: 60,
    level: 'Intermediate',
    topics: ['data-quality'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-enforcement`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/qeaxcdqe0sz8',
    overview:
      'Infrahub enforces data quality at every layer rather than in one place. Schema constraints fire the moment data is written, branch isolation keeps every mutation off main until it has been reviewed, Python checks run against proposed changes, and Profiles keep shared values consistent by construction.',
    whatYouWillLearn: [
      'Apply schema constraints that reject bad data on write',
      'Keep every change isolated on a branch until it is reviewed',
      'Run Python checks against a proposed change',
      'Use Profiles to keep shared values consistent across objects',
    ],
    status: 'active',
  },
  {
    id: 'design-driven-generator',
    title: 'Design-Driven Generator',
    description:
      'Write and run a Generator that provisions the Munich site, allocating devices, ASNs and management IPs from the source of truth.',
    durationMinutes: 60,
    level: 'Intermediate',
    topics: ['automation'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-generator`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/ul1nwuglxhru',
    overview:
      'Generators turn a design into real objects. Here you write one that reads OtterNet campus site design and provisions every device at the new Munich site automatically, with the right names and the right resources, none of it typed by hand.',
    whatYouWillLearn: [
      'Write a Generator that reads a site design',
      'Create devices from templates in bulk',
      'Allocate ASNs and management IP addresses from resource pools',
      'Run the Generator and inspect exactly what it produced',
    ],
    status: 'active',
  },
  {
    id: 'transforms-config-rendering',
    title: 'Transforms and Config Rendering',
    description:
      'Render a deployable router configuration from a Jinja2 Transform, pulling every value from the source of truth.',
    durationMinutes: 60,
    level: 'Intermediate',
    topics: ['config-rendering'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-transforms`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/eha2fxwprzok',
    overview:
      'The closing lab of the OtterNet series. Explore a Jinja2 Transform and render a complete, deployable router configuration for a Munich device, with every value pulled from the source of truth rather than typed into a template.',
    whatYouWillLearn: [
      'Read a Jinja2 Transform and the GraphQL query behind it',
      'Render a full device configuration from source-of-truth data',
      'Trace each rendered value, from hostname to BGP ASN, back to the object it came from',
    ],
    status: 'active',
  },

  // --- Standalone Infrahub labs -------------------------------------------
  // Titles follow the docs wording. Instruqt titles differ (Infrahub getting
  // started, Infrahub schema introduction, Infrahub artifact introduction).
  // Durations follow Instruqt where it sets one.
  {
    id: 'first-tour',
    title: 'First Tour of Infrahub',
    description:
      'A guided overview of branching, the flexible schema and unified storage, to see what Infrahub does and whether it fits your needs.',
    durationMinutes: 60,
    level: 'Beginner',
    topics: ['getting-started'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-getting-started`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/7jdp4cuqbcvb',
    overview:
      'Infrahub combines Git-like version control with a flexible graph database, across three core pillars: branching and version control, a flexible schema, and unified storage. This lab gives you a ready-to-use environment to explore all three with no setup overhead, through practical exercises against a running instance.',
    whatYouWillLearn: [
      'See how branching and version control apply to infrastructure data',
      'Understand how a flexible schema puts you in control of the data model',
      'Store files alongside data through the Git repository integration',
      'Judge whether Infrahub fits your own infrastructure management needs',
    ],
    prerequisites: 'No prior experience with Infrahub required.',
    status: 'active',
  },
  {
    id: 'schema-deep-dive',
    title: 'Schema Deep Dive',
    description:
      'Consume the schema library, create your own schema, and safely extend one that is already in use.',
    durationMinutes: 120,
    level: 'Intermediate',
    topics: ['schema-modeling'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-schema-introduction`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/tvg3faduoyuj',
    overview:
      'The Infrahub schema is flexible by design, but that flexibility raises questions the first time you meet it. Where do schemas come from, how do you write your own, and how do you safely extend one that is already in use. This lab walks through all three.',
    whatYouWillLearn: [
      'Consume the schema library to load ready-made node types in minutes',
      'Create a schema from scratch for your own use case',
      'Extend an existing schema with new attributes and relationships',
    ],
    prerequisites: 'Complete First Tour of Infrahub first.',
    status: 'active',
  },
  {
    id: 'deploy-first-configuration',
    title: 'Deploy Your First Configuration',
    description:
      'Build a GraphQL query and a Jinja2 template, connect a Git repository, and generate a real device configuration as an artifact.',
    durationMinutes: 60,
    level: 'Intermediate',
    topics: ['config-rendering', 'automation'],
    trackUrl: `${INSTRUQT_TRACKS}/infrahub-artifact-introduction`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/hqia0uwvqe94',
    overview:
      'Artifact generation combines structured data, GraphQL queries and Jinja2 templates to produce deployable device configuration, so the data and the templates that consume it never drift apart. In this lab you build that pipeline yourself: define the query, write the template, and generate a real device configuration from the source of truth.',
    whatYouWillLearn: [
      'Write focused GraphQL queries that extract exactly the data a template needs',
      'Build reusable Jinja2 templates for device configuration',
      'Connect a Git repository so Infrahub imports your queries and transformations',
      'Test changes safely on a branch and validate artifacts through a proposed change',
    ],
    prerequisites: 'Basic experience with Infrahub, Ansible, Jinja and GraphQL.',
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
    topics: ['schema-modeling'],
    trackUrl: `${INSTRUQT_TRACKS}/workshop-b2-lab1`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/m3xwbfyrxg1d',
    overview:
      'The lab behind the OpsMill workshop at AutoCon3 in May 2025, in two halves. The first works through three schema languages, Pydantic, JSON Schema and GraphQL, with practical examples of how each one validates data. The second looks at how that data is actually stored, comparing SQLite with Neo4j.',
    whatYouWillLearn: [
      'Compare Pydantic, JSON Schema and GraphQL as ways to describe data',
      'Modify a schema and see the effect on validation',
      'Inspect the same schema and data in SQLite and in Neo4j',
      'See how a graph database handles many-to-many relationships',
    ],
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
    topics: ['schema-modeling'],
    trackUrl: `${INSTRUQT_TRACKS}/workshop-b2-lab2`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/hbqdymwlcgvj',
    overview:
      'The second lab of the AutoCon3 workshop. Model a network in Infrahub by combining role, status and kind into one strict model, then weigh what that strictness buys you against what it costs. It ends with an open Infrahub sandbox to experiment in.',
    whatYouWillLearn: [
      'Set up a baseline schema in Infrahub',
      'Add an attribute to an existing node and extend the schema with new nodes',
      'Explore the schema and query the data with GraphQL',
      'Judge the trade-offs of a strict role, status and kind model',
    ],
    prerequisites: 'Complete Schema Languages and Databases in Practice first.',
    status: 'active',
  },

  // --- Community and partner labs hosted by OpsMill -----------------------
  // Instruqt sets no duration for these. Values are estimates.
  {
    id: 'ibm-low-code-orchestration',
    title: 'Low-Code Network Orchestration with IBM',
    description:
      'Build low-code workflows with IBM Rapid Infrastructure Automation that open a branch and change request in Infrahub, approve it, and deploy to Arista routers.',
    durationMinutes: 90,
    level: 'Intermediate',
    topics: ['automation'],
    trackUrl: `${INSTRUQT_TRACKS}/workshop-d4-lab1`,
    overview:
      'An IBM workshop on low-code network orchestration with Rapid Infrastructure Automation. Build workflows that expose existing automation as a service to other teams, add ChatOps, and drive a device lifecycle end to end with Infrahub as the source of truth.',
    whatYouWillLearn: [
      'Build a low-code workflow that opens a branch, a service and a change request in Infrahub',
      'Review and merge those changes in Infrahub',
      'Deploy approved configuration to Arista routers from a workflow',
      'Add generative AI assisted trouble ticketing and ChatOps',
    ],
    prerequisites: 'Familiarity with network automation concepts. No IBM product experience required.',
    owner: { name: 'IBM' },
    status: 'retired',
  },
  {
    id: 'network-testing-nuts',
    title: 'Network Testing with NUTS',
    description:
      'Use Infrahub as the source for Network Unit Testing System tests, run them against a containerlab network, and visualise results in Grafana.',
    durationMinutes: 60,
    level: 'Intermediate',
    topics: ['testing'],
    trackUrl: `${INSTRUQT_TRACKS}/urs-workshop-ac3`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/yn4xm8akfgns',
    overview:
      'An AutoCon3 workshop on the INPG stack: Infrahub, NUTS, Prometheus and Grafana. Infrahub supplies the intent, the Network Unit Testing System turns it into tests for every device, and the results are visualised rather than read off a terminal. The aim is continuous network testing instead of the manual testing still common in practice.',
    whatYouWillLearn: [
      'Generate the artifacts containerlab and NUTS need, straight from Infrahub',
      'Start a virtual network and run the generated tests against it',
      'Push test results to Prometheus and visualise them in Grafana',
    ],
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
    topics: ['observability'],
    trackUrl: `${INSTRUQT_TRACKS}/modern-network-observability`,
    inviteUrl: 'https://play.instruqt.com/opsmill/invite/exuwohikyyca',
    overview:
      'The AutoCon5 Modern Network Observability workshop, delivered as a lab. A complete, self-contained stack runs in the lab VM, with Prometheus, Loki, Grafana, Alertmanager, Telegraf, Vector, Prefect and Infrahub as the source of truth, fed by a synthetic telemetry generator standing in for a small network. No real network gear is required. You play an engineer on their first deep day of the on-call rotation.',
    whatYouWillLearn: [
      'Learn PromQL and LogQL from scratch against live telemetry',
      'Find a broken BGP peer and tie the metric anomaly to the log line that explains it',
      'Build a Grafana panel and a matching alert rule, and walk the alert lifecycle',
      'Trace an alert through Alertmanager into a workflow that consults Infrahub for intent',
      'Triage a multi-layer incident solo, contain it, recover, and write the runbook',
    ],
    prerequisites: 'Comfortable on a Linux shell. No prior Prometheus, Loki or Grafana experience required.',
    owner: { name: 'Christian Adell', url: 'https://www.linkedin.com/in/christianadell/' },
    status: 'active',
  },
];

/**
 * Page sections, in the order they appear. A section with no active labs is
 * hidden, so a group can sit here empty until its first lab arrives.
 */
export const sections: Section[] = [
  {
    kind: 'track',
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
    overview:
      'Join the network automation team at a fictional operator called OtterNet and learn Infrahub by working through a real use case. The five labs share one dataset and together give a full tour of the product, from schema design to automated configuration deployment. Each builds on the concepts introduced by the one before, so they are best taken in order, but you can finish one and come back for the rest later.',
    whatYouWillLearn: [
      'Modelling infrastructure data with custom node types, generic hierarchies and inheritance',
      'Enforcing data quality through schema constraints, branch isolation and Python checks',
      'Keeping shared values consistent using resource pools and Profiles',
      'Automating provisioning with design-driven Generators',
      'Rendering deployable configuration from source-of-truth data with Jinja2 Transforms',
      'Reaching Infrahub programmatically through infrahubctl and the Python SDK',
    ],
    prerequisites: 'No prior experience with Infrahub required.',
  },
  {
    kind: 'group',
    id: 'standalone-infrahub-labs',
    title: 'Standalone Infrahub labs',
    description:
      'Self-contained labs on a single topic. Take them in any order, or use one to go deeper on something the track introduced.',
    labIds: ['first-tour', 'schema-deep-dive', 'deploy-first-configuration'],
  },
  {
    kind: 'track',
    id: 'autocon3-workshop',
    title: 'AutoCon3 Workshop: Modeling Infrastructure Data',
    description:
      'The two labs behind the OpsMill workshop at AutoCon3 in May 2025. Start with schema languages and databases in general, then apply the ideas to a network model in Infrahub.',
    labIds: ['schema-languages-databases', 'network-modeling-with-infrahub'],
    overview:
      'The two labs behind the OpsMill workshop at AutoCon3 in May 2025. The first is deliberately not about Infrahub: it compares schema languages and database engines on their own terms. The second applies those ideas to a network model in Infrahub, so the trade-offs you meet in the first lab have somewhere concrete to land.',
    whatYouWillLearn: [
      'How Pydantic, JSON Schema and GraphQL differ as ways to describe data',
      'How the same data is stored in a relational database and in a graph database',
      'How to model a network in Infrahub with a strict role, status and kind model',
    ],
    prerequisites: 'No Infrahub experience required. Basic Python and SQL help.',
  },
  {
    kind: 'group',
    id: 'community-and-partner',
    title: 'Community and partner labs',
    description:
      'Labs built by partners and community members that use Infrahub alongside their own tools. OpsMill hosts them on Instruqt but does not author or support the content, so questions about a lab go to its owner.',
    labIds: ['ibm-low-code-orchestration', 'network-testing-nuts', 'modern-network-observability'],
  },
];
