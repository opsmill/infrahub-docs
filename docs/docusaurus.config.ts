import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import globalVars from './globalVars';
import path from 'path';
import { redirects_migration } from './redirects-doc-migration';
import { redirects_academy_to_learn } from './redirects-academy-to-learn';
import { redirects_backup_guides } from './redirects-backup-guides';
import { editUrlFor } from './doc-sources';

function getDocsRelative(filePath) {
  const rootDocsDir = path.join(process.cwd(), 'docs');
  const currentDir = path.dirname(filePath);
  const nestedDocsDir = path.join(rootDocsDir, 'docs');
  const relativePath = path.relative(currentDir, nestedDocsDir);
  const segments = relativePath.split(path.sep);
  return '../'.repeat(segments.length - 1);
}

const config: Config = {
  title: "Infrahub Documentation",
  tagline: "Explore our guides and examples for Infrahub",
  favicon: "img/favicon.ico",
  scripts: [
    ...(process.env.ANALYTICS ? [
      {
        src: 'https://plausible.io/js/script.js',
        defer: true,
        'data-domain': 'docs.infrahub.app'
      }, {
        src: '/js/custom-reo.js'
      }, {
        src: 'https://static.claydar.com/init.v1.js?id=cbhzbmnLAA'
      }
    ] : []),
    {
      // Kapa.ai Ask AI widget, with a search tab. The navbar search and Cmd/Ctrl+K stay on Algolia. The website ID is public: it is safe to commit it.
      src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
      async: true,
      'data-website-id': '296dff8a-e375-4941-82ae-1d95f1effa44',
      'data-project-name': 'opsmill',
      'data-project-logo': 'https://avatars.githubusercontent.com/u/118297816?s=200&v=4',
      'data-modal-title': 'OpsMill AI',
      'data-modal-title-search': 'Search OpsMill docs',
      // Match the site's Inter font instead of the default system stack.
      'data-font-family': 'Inter, system-ui, -apple-system, sans-serif',
      // Follow the Docusaurus light/dark toggle instead of the OS preference.
      'data-color-scheme-selector': "[data-theme='dark']",
      // Brand accents: Infrahub blue for links, toggles and the send button.
      'data-project-color': '#426DB1',
      'data-anchor-color': '#426DB1',
      'data-anchor-color-dark': '#8EA7D0',
      // Neutral surfaces taken from the site theme (src/css/custom.css) so the
      // widget looks like part of the page; brand colour is kept for accents.
      'data-surface-color': '#FFFFFF',
      'data-surface-elevated-color': '#F9F9F9',
      'data-surface-hover-color': '#ECF0F7',
      'data-text-color': '#130D30',
      'data-text-muted-color': '#655B89',
      'data-border-color': '#E5E7EB',
      'data-surface-color-dark': '#1E2327',
      'data-surface-elevated-color-dark': '#151A1C',
      'data-surface-hover-color-dark': '#2A3035',
      'data-text-color-dark': '#E9E8EE',
      'data-text-muted-color-dark': '#A1A8B0',
      'data-border-color-dark': '#3A4045',
      // Kapa's own launcher is replaced by a custom pill (src/theme/Root.tsx).
      'data-launcher-button-hidden': 'true',
      // Modal: rounded, light header with a thin divider instead of a solid band.
      'data-modal-border-radius': '14px',
      'data-modal-header-background-color': '#FFFFFF',
      'data-modal-header-background-color-dark': '#1E2327',
      'data-modal-header-border-bottom': '1px solid #E5E7EB',
      'data-modal-header-border-bottom-dark': '1px solid #3A4045',
      'data-modal-title-color': '#231556',
      'data-modal-title-color-dark': '#E9E8EE',
      'data-modal-title-font-weight': '600',
      // Inputs and buttons.
      'data-query-input-border-radius': '10px',
      'data-query-input-focus-border-color': '#426DB1',
      'data-query-input-focus-border-color-dark': '#8EA7D0',
      'data-submit-button-background-color': '#426DB1',
      'data-submit-button-hover-background-color': '#231556',
      'data-submit-button-hover-background-color-dark': '#557CB9',
      'data-example-question-button-hover-border-color': '#426DB1',
      'data-source-link-hover-border-color': '#426DB1',
      // Search tab inside the Kapa modal. Kapa's Cmd/Ctrl+K shortcut stays off so it
      // does not conflict with Algolia DocSearch.
      'data-search-mode-enabled': 'true',
      'data-search-input-placeholder': 'Search the documentation...',
      'data-search-result-target': '_self',
      'data-search-result-badge-background-color': '#ECF0F7',
      'data-search-result-badge-color': '#426DB1',
      'data-search-result-badge-background-color-dark': '#2A3035',
      'data-search-result-badge-color-dark': '#8EA7D0',
    },
  ],

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'algolia-site-verification',
        content: '3BD5875DCE009A8F',
      },
    },
  ],

  url: process.env.DOCS_IN_APP ? "http://localhost:8000" : "https://docs.infrahub.app",
  baseUrl: process.env.DOCS_IN_APP ? "/docs/" : "/",
  organizationName: "opsmill",
  projectName: "infrahub",

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  onDuplicateRoutes: "throw",
  noIndex: false,
  trailingSlash: false,

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarCollapsed: true,
          sidebarPath: "./sidebars.ts",
          editUrl: editUrlFor('default'),
          exclude: ["**/AGENTS.md", "tutorials/getting-started/**"],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        gtag: {
          trackingID: process.env.GA_MEASUREMENT_ID ?? "G-FNVRQ6HH0B",
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    // Scans release-notes frontmatter into global data for <ReleaseFeed/>.
    './plugins/release-notes-data',
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/overview/schema',
            to: '/overview',
          },
          {
            from: '/overview/versioning',
            to: '/overview',
          },
          {
            from: '/overview/generators',
            to: '/overview',
          },
          {
            from: '/python-sdk',
            to: '/python-sdk/introduction',
          },
          {
            from: '/infrahubctl',
            to: '/infrahubctl/infrahubctl',
          },
          {
            from: '/ansible/ansible/',
            to: '/ansible/',
          },
          {
            from: '/integrations/infrahub-ansible/',
            to: '/ansible/',
          },
          {
            from: '/nornir/nornir/',
            to: '/nornir/',
          },
          {
            from: '/sync/sync/',
            to: '/sync/',
          },
          {
            from: '/emma/emma/',
            to: '/emma/',
          },
          // This covers all the redirects setup during doc migration
          ...redirects_migration,
          // "academy" section renamed to "learn"
          ...redirects_academy_to_learn,
          // Infrahub Backup "guides" pages moved to "backup" and "collect"
          ...redirects_backup_guides,
        ],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-demo-dc',
        editUrl: editUrlFor('docs-demo-dc'),
        path: 'docs-demo-dc',
        routeBasePath: 'demo-dc',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-demo-dc.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-emma',
        editUrl: editUrlFor('docs-emma'),
        path: 'docs-emma',
        routeBasePath: 'emma',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-emma.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-vscode',
        editUrl: editUrlFor('docs-vscode'),
        path: 'docs-vscode',
        routeBasePath: 'vscode',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-vscode.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-nornir',
        editUrl: editUrlFor('docs-nornir'),
        path: 'docs-nornir',
        routeBasePath: 'nornir',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-nornir.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-sync',
        editUrl: editUrlFor('docs-sync'),
        path: 'docs-sync',
        routeBasePath: 'sync',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-sync.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-ansible',
        editUrl: editUrlFor('docs-ansible'),
        path: 'docs-ansible',
        routeBasePath: 'ansible',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-ansible.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-schema-library',
        editUrl: editUrlFor('docs-schema-library'),
        path: 'docs-schema-library',
        routeBasePath: 'schema-library',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-schema.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-python-sdk',
        editUrl: editUrlFor('docs-python-sdk'),
        path: 'docs-python-sdk/python-sdk',
        routeBasePath: 'python-sdk',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-python-sdk.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'infrahubctl',
        editUrl: editUrlFor('infrahubctl'),
        path: 'docs-python-sdk/infrahubctl',
        routeBasePath: 'infrahubctl',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-infrahubctl.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-service-catalog',
        editUrl: editUrlFor('docs-service-catalog'),
        path: 'docs-service-catalog',
        routeBasePath: 'demo-service-catalog',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-service-catalog.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-exporter',
        editUrl: editUrlFor('docs-exporter'),
        path: 'docs-exporter',
        routeBasePath: 'exporter',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-exporter.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-mcp',
        editUrl: editUrlFor('docs-mcp'),
        path: 'docs-mcp',
        routeBasePath: 'mcp',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-mcp.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-ai-skills',
        editUrl: editUrlFor('docs-ai-skills'),
        path: 'docs-ai-skills',
        routeBasePath: 'skills',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-ai-skills.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-integrations',
        editUrl: editUrlFor('docs-integrations'),
        path: 'docs-integrations',
        routeBasePath: 'integrations',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-integrations.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-backup',
        editUrl: editUrlFor('docs-backup'),
        path: 'docs-backup',
        routeBasePath: 'backup',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-backup.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-infrahub-solution-ai-dc',
        editUrl: editUrlFor('docs-infrahub-solution-ai-dc'),
        path: 'docs-infrahub-solution-ai-dc',
        routeBasePath: 'infrahub-solution-ai-dc',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-solution-ai-dc.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-arista-avd',
        editUrl: editUrlFor('docs-arista-avd'),
        path: 'docs-arista-avd',
        routeBasePath: 'arista-avd',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-arista-avd.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-infrahub-demo-sp',
        editUrl: editUrlFor('docs-infrahub-demo-sp'),
        path: 'docs-infrahub-demo-sp',
        routeBasePath: 'infrahub-demo-sp',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-infrahub-demo-sp.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-demo-otn',
        editUrl: editUrlFor('docs-demo-otn'),
        path: 'docs-demo-otn',
        routeBasePath: 'demo-otn',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-demo-otn.ts',
      },
    ],
    [
      '@docusaurus/plugin-google-tag-manager',
      {
        containerId: 'GTM-MQ2RZ3SP',
      },
    ],
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'Infrahub by OpsMill - Documentation',
        siteDescription: 'Infrahub by OpsMill - the modern infrastructure data management platform. Infrahub is the open-source product built by OpsMill (https://opsmill.com).',
        depth: 2,
        content: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: true,
          includeBlog: false,
          includePages: true,
          includeDocs: true,
          includeVersionedDocs: true,
          relativePaths: true
        }
      },
    ],
  ],
  themes: [
    '@docusaurus/theme-mermaid',
  ],
  themeConfig: {
    announcementBar: {
      id: 'docs-restructure-2026',
      content: '📚 New docs structure: content is now grouped by capability, not split across Topics and Guides. <a href="/release-notes/infrahub/docs-restructure"><strong>See what changed →</strong></a>',
      isCloseable: true,
    },
    navbar: {
      logo: {
        alt: "Infrahub",
        src: "img/infrahub-hori.svg",
        srcDark: "img/infrahub-hori-dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          label: "Infrahub Docs",
        },
        {
          to: "/labs",
          label: "Labs",
          position: "left",
          // The per-lab detail pages live in the Infrahub docs, so stay
          // highlighted there: /labs is the way back to the catalogue.
          activeBaseRegex: "^/(labs|learn/labs)",
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Tools & SDKs',
          items: [
            {
              type: "docSidebar",
              sidebarId: "pythonSdkSidebar",
              label: "Python SDK",
              docsPluginId: "docs-python-sdk",
            },
            {
              type: "docSidebar",
              sidebarId: "infrahubctlSidebar",
              label: "Infrahubctl",
              docsPluginId: "infrahubctl",
            },
            {
              type: "docSidebar",
              sidebarId: "emmaSidebar",
              label: "Infrahub Assistant | Emma",
              docsPluginId: "docs-emma",
            },
            {
              type: "docSidebar",
              sidebarId: "vscodeSidebar",
              label: "VScode Extension for Infrahub",
              docsPluginId: "docs-vscode",
            },
            {
              type: "docSidebar",
              sidebarId: "mcpSidebar",
              label: "MCP Server for Infrahub",
              docsPluginId: "docs-mcp",
            },
            {
              type: "docSidebar",
              sidebarId: "AISkillsSidebar",
              label: "Infrahub AI Skills",
              docsPluginId: "docs-ai-skills",
            },
            // Backup and Collect share the docs-backup plugin and the
            // infrahubOpsSidebar, so docSidebar/doc navbar items both match the
            // whole sidebar and highlight together. Use plain links with
            // activeBaseRegex so each highlights only for its own routes:
            // everything under /backup/ except /backup/collect/ maps to Backup.
            {
              to: "/backup/",
              label: "Infrahub Backup",
              activeBaseRegex: "/backup/(?!collect)",
            },
            {
              to: "/backup/collect/",
              label: "Infrahub Collect",
              activeBaseRegex: "/backup/collect",
            },
          ],
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Integrations',
          items: [
            {
              type: "docSidebar",
              sidebarId: "integrationsSidebar",
              label: "All Integrations",
              docsPluginId: "docs-integrations",
            },
            {
              type: "docSidebar",
              sidebarId: "ansibleSidebar",
              label: "Ansible",
              docsPluginId: "docs-ansible",
            },
            {
              type: "docSidebar",
              sidebarId: "aristaAvdSidebar",
              label: "Arista AVD",
              docsPluginId: "docs-arista-avd",
            },
            {
              type: "docSidebar",
              sidebarId: "exporterSidebar",
              label: "Infrahub Exporter",
              docsPluginId: "docs-exporter",
            },
            {
              type: "docSidebar",
              sidebarId: "syncSidebar",
              label: "Infrahub Sync",
              docsPluginId: "docs-sync",
            },
            {
              type: "docSidebar",
              sidebarId: "nornirSidebar",
              label: "Nornir",
              docsPluginId: "docs-nornir",
            },
          ],
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Demos',
          items: [
            {
              type: "docSidebar",
              sidebarId: "DemoDcSidebar",
              label: "Data Center",
              docsPluginId: "docs-demo-dc",
            },
            {
              type: "docSidebar",
              sidebarId: "InfrahubDemoSpSidebar",
              label: "Service Provider",
              docsPluginId: "docs-infrahub-demo-sp",
            },
            {
              type: "docSidebar",
              sidebarId: "otnSidebar",
              label: "Optical Transport",
              docsPluginId: "docs-demo-otn",
            },
            {
              type: "docSidebar",
              sidebarId: "servicecatalogSidebar",
              label: "Service Catalog",
              docsPluginId: "docs-service-catalog",
            },
          ],
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Reference Designs',
          items: [
            {
              type: "docSidebar",
              sidebarId: "solutionAiDcSidebar",
              label: "AI Datacenter",
              docsPluginId: "docs-infrahub-solution-ai-dc",
            },
            {
              type: "docSidebar",
              sidebarId: "aristaAvdSidebar",
              label: "Arista AVD",
              docsPluginId: "docs-arista-avd",
            },
          ],
        },
        {
          type: "search",
          position: "right",
        },
        {
          // Links to the repository of the docs section being viewed.
          // Repository mapping lives in src/components/GitHubRepoNavbarItem.tsx.
          type: "custom-githubRepoLink",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
        {
          href: "https://discord.gg/opsmill",
          position: "right",
          className: "header-discord-link",
          "aria-label": "Discord Server",
        },
      ],
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} - Infrahub by OpsMill.`,
    },
    prism: {
      theme: prismThemes.oneDark,
      additionalLanguages: ["bash", "python", "markup-templating", "django", "json", "toml", "yaml"],
    },
    algolia: {
      // The application ID provided by Algolia
      appId: 'MKBNCZRNI3',
      // Public API key: it is safe to commit it
      apiKey: 'f12e2a9c8472d0f5287cc34715a24518',
      indexName: 'Docs',
      // Ask AI is disabled: Kapa.ai provides Ask AI (see the Kapa widget in `scripts` above).
      // askAi: {
      //   assistantId: 'hh3YkWRV6fxH',
      //   indexName: 'Docs',  // Changed from 'Docs-markdown' to use same index
      //   appId: 'MKBNCZRNI3',
      //   apiKey: 'f12e2a9c8472d0f5287cc34715a24518',
      // },
      // Optional: Enable contextual search (default: true)
      // This ensures search results match the current version and language
      contextualSearch: true,
      // Optional: Specify domains for external navigation
      // externalUrlRegex: 'external\\.com|domain\\.com',
      // Optional: Path replacements for different deployments
      replaceSearchResultPathname: {
        from: '/docs/', // or as RegExp: /\/docs\//
        to: '/',
      },
      // Optional: Algolia search parameters
      searchParameters: {},
      // Optional: Path for search page (default: 'search', false to disable)
      searchPagePath: 'search',
      // Optional: Enable insights feature (default: false)
      insights: false,
    },
  } satisfies Preset.ThemeConfig,

  markdown: {
    format: "mdx",
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
    preprocessor: ({ filePath, fileContent }) => {
      console.log(`Processing ${filePath}`);
      const transformedContent = fileContent.replace(/\$\(\s*(\w+)\s*\)/g, (match, variableName) => {
        //console.log(`Found variable: ${variableName}`);
        if (variableName === 'base_url' && globalVars.base_url === 'RELATIVE') {
          return getDocsRelative(filePath);
        }
        return globalVars[variableName] || match;
      });
      return transformedContent;
    },
  },
};

export default config;
