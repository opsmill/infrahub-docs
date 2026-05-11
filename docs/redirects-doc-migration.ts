/**
 * Consolidated redirect table for the docs migration (Phase 2).
 *
 * All paths are relative to the site root (no /docs/ prefix) which matches
 * the production Docusaurus setup: routeBasePath "/" and baseUrl "/".
 *
 * Usage in docusaurus.config.ts:
 *
 *   import { redirects } from './redirects';
 *   // ...
 *   plugins: [
 *     ['@docusaurus/plugin-client-redirects', { redirects }],
 *   ],
 *
 * Once live, delete docs/redirects-pending/ and this comment block.
 */

type Redirect = { from: string | string[]; to: string };

export const redirects_migration: Redirect[] = [
    // ── Schema & Data ─────────────────────────────────────────────────────────
    { from: '/topics/schema', to: '/schema/overview' },
    { from: '/topics/schema-extensions', to: '/schema/extensions' },
    { from: '/topics/schema-display', to: '/schema/field-visibility' },
    { from: '/topics/order-weight', to: '/schema/order-weight' },
    { from: '/topics/labels', to: '/schema/display_label' },
    { from: '/topics/file-object', to: '/schema/file-object' },
    { from: '/topics/schema-attr-kind-number-pool', to: '/schema/number-pool' },
    { from: '/guides/create-schema', to: '/academy/tutorials/build-your-first-schema' },
    { from: '/guides/import-schema', to: '/schema/create-and-load' },

    // ── Objects & Object Templates ────────────────────────────────────────────
    { from: '/topics/object-template', to: '/object-templates/overview' },
    { from: '/guides/object-template', to: '/object-templates/use' },
    { from: '/topics/object-conversion', to: '/objects/convert-object-kind' },
    { from: '/topics/metadata', to: '/objects/metadata' },
    { from: '/guides/object-load', to: '/objects/load-from-yaml' },

    // ── Profiles ──────────────────────────────────────────────────────────────
    { from: '/topics/profiles', to: '/profiles/overview' },
    { from: '/guides/profiles', to: '/profiles/overview' },

    // ── Computed Attributes ───────────────────────────────────────────────────
    { from: '/topics/computed-attributes', to: '/computed-attributes/overview' },
    { from: '/guides/computed-attributes', to: '/computed-attributes/overview' },

    // ── Menu Customization ────────────────────────────────────────────────────
    { from: '/guides/menu', to: '/menu/overview' },

    // ── Artifact & File Storage ───────────────────────────────────────────────
    { from: '/topics/object-storage', to: '/artifact-file-storage/overview' },
    { from: '/guides/object-storage', to: '/artifact-file-storage/configure' },

    // ── Artifacts ─────────────────────────────────────────────────────────────
    { from: '/topics/artifact', to: '/artifacts/overview' },
    { from: '/guides/artifact', to: '/artifacts/use' },
    { from: '/guides/artifact-content-composition', to: '/artifacts/content-composition' },

    // ── Transformations ───────────────────────────────────────────────────────
    { from: '/topics/transformation', to: '/transformations/overview' },
    { from: '/guides/jinja2-transform', to: '/academy/tutorials/transformations/build-a-jinja2-transformation' },
    { from: '/guides/python-transform', to: '/academy/tutorials/transformations/build-a-python-transformation' },

    // ── Generators ────────────────────────────────────────────────────────────
    { from: '/topics/generator', to: '/generators/overview' },
    { from: '/guides/generator', to: '/academy/tutorials/generators/build-your-first-generator' },
    { from: '/guides/chaining-generators', to: '/academy/tutorials/generators/build-chained-generators' },
    { from: '/topics/modular-generators', to: '/generators/modular' },
    { from: '/guides/modular-generator-best-practices', to: '/generators/modular-best-practices' },

    // ── Webhooks ──────────────────────────────────────────────────────────────
    { from: '/topics/webhooks', to: '/webhooks/overview' },
    { from: '/guides/webhooks', to: '/webhooks/create' },

    // ── Events ────────────────────────────────────────────────────────────────
    { from: '/topics/events', to: '/events/event-system' },
    { from: '/topics/event-actions', to: '/events/overview' },
    { from: '/guides/events-rules-actions', to: '/events/overview' },

    // ── Resource Manager ─────────────────────────────────────────────────────
    { from: '/topics/resource-manager', to: '/resource-manager/overview' },
    { from: '/guides/resource-manager', to: '/resource-manager/overview' },

    // ── IPAM ──────────────────────────────────────────────────────────────────
    { from: '/topics/ipam', to: '/ipam/overview' },

    // ── Branches & Change Control ─────────────────────────────────────────────
    // Branches
    { from: '/branching', to: '/branches/overview' },
    { from: '/topics/branching', to: '/branches/overview' },
    // Proposed Changes
    { from: '/proposed-change', to: '/proposed-changes/overview' },
    { from: '/topics/proposed-change', to: '/proposed-changes/overview' },
    // Checks
    { from: '/topics/check', to: '/checks/overview' },
    { from: '/guides/check', to: '/academy/tutorials/build-a-check' },
    // Git Integration
    { from: '/topics/repository', to: '/git-integration/overview' },
    { from: '/guides/repository', to: '/git-integration/connect-repository' },
    { from: '/topics/infrahub-yml', to: '/git-integration/infrahub-yml' },
    { from: '/topics/branch-synchronization', to: '/git-integration/branch-synchronization' },
    { from: '/guides/selective-branch-sync', to: '/git-integration/branch-synchronization' },
    // Change Approval
    { from: '/guides/change-approval-workflow', to: '/change-approval/change-approval-workflow' },

    // ── Testing Framework ─────────────────────────────────────────────────────
    { from: '/topics/resources-testing-framework', to: '/testing-framework/overview' },

    // ── Development Resources ─────────────────────────────────────────────────
    { from: '/topics/developer-guide', to: '/development-resources/developer-guide' },
    { from: '/topics/graphql', to: '/development-resources/graphql/' },
    { from: '/guides/graphql-fragment', to: '/development-resources/graphql-fragments' },

    // ── Deploy & Manage — Install & Configure ────────────────────────────────
    { from: '/topics/hardware-requirements', to: '/deploy-manage/install-configure/hardware-requirements' },
    { from: '/guides/installation', to: '/deploy-manage/install-configure/install/' },
    { from: '/guides/production-deployment', to: '/deploy-manage/install-configure/production-deployment/' },
    { from: '/guides/configuration-changes', to: '/deploy-manage/install-configure/configure-infrahub' },

    // ── Deploy & Manage — Run & Observe ──────────────────────────────────────
    { from: '/topics/tasks', to: '/deploy-manage/run-observe/tasks' },
    { from: '/guides/telemetry', to: '/deploy-manage/run-observe/telemetry' },
    { from: '/topics/activity-log', to: '/deploy-manage/run-observe/activity-log' },
    { from: '/topics/log-forwarding', to: '/deploy-manage/run-observe/log-forwarding/' },
    { from: '/guides/log-forwarding', to: '/deploy-manage/run-observe/log-forwarding/configure-log-forwarding' },

    // ── Deploy & Manage — Maintain & Upgrade ────────────────────────────────
    { from: '/guides/upgrade', to: '/deploy-manage/maintain-upgrade/upgrade/' },
    { from: '/topics/database-backup', to: '/deploy-manage/maintain-upgrade/database-backup/' },
    { from: '/guides/database-backup', to: '/deploy-manage/maintain-upgrade/database-backup/backup-and-restore' },

    // ── Deploy & Manage — User Management & Security ─────────────────────────
    { from: '/topics/authentication', to: '/deploy-manage/user-management/authentication' },
    { from: '/guides/sso', to: '/deploy-manage/user-management/sso/' },
    { from: '/topics/permissions-roles', to: '/deploy-manage/user-management/permissions-roles/' },
    { from: '/guides/accounts-permissions', to: '/deploy-manage/user-management/permissions-roles/manage-accounts-and-permissions' },
    { from: '/guides/managing-api-tokens', to: '/deploy-manage/user-management/managing-api-tokens' },

    // ── Missing guide pages ───────────────────────────────────────────────────
    { from: '/guides/customize-field-ordering', to: '/schema/order-weight' },
    { from: '/guides/groups', to: '/groups/overview' },
    { from: '/guides/object-conversion', to: '/objects/convert-object-kind' },

    // ── Missing topic pages ───────────────────────────────────────────────────
    { from: '/topics/architecture', to: '/overview/architecture' },
    { from: '/topics/bus-event-handling', to: '/reference/message-bus-events' },
    { from: '/topics/community-vs-enterprise', to: '/overview/community-vs-enterprise' },
    { from: '/topics/groups', to: '/groups/overview' },
    { from: '/topics/local-demo-environment', to: '/development-resources/local-demo-environment' },
    { from: '/topics/version-control', to: '/immutable-history/overview' },

    // ── Legacy top-level section indexes ─────────────────────────────────────
    // /guides and /topics were Docusaurus generated-index pages for the old sidebar
    // sections. Both sections have been replaced by the new domain-based structure.
    { from: ['/guides', '/topics'], to: '/' },

    // ── Legacy category index pages ───────────────────────────────────────────
    // These /category/* URLs were auto-generated by Docusaurus from the old sidebar
    // category labels. Slugs: spaces→hyphens, "&"→double-hyphens, duplicates→-1 suffix.

    // Old "Guides" sub-categories
    { from: '/category/installation--setup', to: '/deploy-manage/install-configure/install/' },
    { from: '/category/schema--data-modeling', to: '/schema-and-data' },
    { from: '/category/data-management', to: '/schema-and-data' },
    { from: '/category/artifact--transform', to: '/automation-and-outputs' },
    { from: '/category/generators', to: '/generators/overview' },
    { from: '/category/integration--events', to: '/events/overview' },
    { from: '/category/user-management--authentication', to: '/deploy-manage/user-management/authentication' },

    // Old "Topics > Overview" sub-category
    { from: '/category/overview', to: '/overview/overview' },

    // Old "Topics > Core Concepts" and its sub-categories
    { from: '/category/core-concepts', to: '/schema-and-data' },
    { from: '/category/git-integration', to: '/git-integration/overview' },
    { from: '/category/transforms--artifacts', to: '/automation-and-outputs' },
    { from: '/category/generators-1', to: '/generators/overview' },
    { from: '/category/version-control--branching', to: '/branches-and-change-control' },
    { from: '/category/file-storage', to: '/artifact-file-storage/overview' },
    { from: '/category/schema', to: '/schema/overview' },
    { from: '/category/data-management-1', to: '/schema-and-data' },
    { from: '/category/ipam', to: '/ipam/overview' },

    // Old "Topics > Platform Capabilities" and its sub-categories
    { from: '/category/platform-capabilities', to: '/deployment-and-management' },
    { from: '/category/user-management--authentication-1', to: '/deploy-manage/user-management/authentication' },
    { from: '/category/event-management--logging', to: '/events/overview' },
    { from: '/category/system-administration', to: '/deployment-and-management' },

    // Old "Topics > Development Resources"
    { from: '/category/development-resources', to: '/development-resources' },

    // ── Feature hub index → overview backward-compat ─────────────────────────
    // Old canonical /X/ URLs (from index.mdx) now redirect to /X/overview.
    { from: ['/schema', '/schema/'], to: '/schema/overview' },
    { from: ['/artifact-file-storage', '/artifact-file-storage/'], to: '/artifact-file-storage/overview' },
    { from: ['/artifacts', '/artifacts/'], to: '/artifacts/overview' },
    { from: ['/branches', '/branches/'], to: '/branches/overview' },
    { from: ['/checks', '/checks/'], to: '/checks/overview' },
    { from: ['/computed-attributes', '/computed-attributes/'], to: '/computed-attributes/overview' },
    { from: ['/events', '/events/'], to: '/events/overview' },
    { from: ['/generators', '/generators/'], to: '/generators/overview' },
    { from: ['/git-integration', '/git-integration/'], to: '/git-integration/overview' },
    { from: ['/groups', '/groups/'], to: '/groups/overview' },
    { from: ['/immutable-history', '/immutable-history/'], to: '/immutable-history/overview' },
    { from: ['/ipam', '/ipam/'], to: '/ipam/overview' },
    { from: ['/menu', '/menu/'], to: '/menu/overview' },
    { from: ['/object-templates', '/object-templates/'], to: '/object-templates/overview' },
    { from: ['/objects', '/objects/'], to: '/objects/overview' },
    { from: ['/profiles', '/profiles/'], to: '/profiles/overview' },
    { from: ['/proposed-changes', '/proposed-changes/'], to: '/proposed-changes/overview' },
    { from: ['/resource-manager', '/resource-manager/'], to: '/resource-manager/overview' },
    { from: ['/testing-framework', '/testing-framework/'], to: '/testing-framework/overview' },
    { from: ['/transformations', '/transformations/'], to: '/transformations/overview' },
    { from: ['/webhooks', '/webhooks/'], to: '/webhooks/overview' },
];
