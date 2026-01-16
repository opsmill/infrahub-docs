import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import globalVars from './globalVars';
import path from 'path';

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
  scripts: process.env.ANALYTICS ? [
    {
      src: 'https://plausible.io/js/script.js',
      defer: true,
      'data-domain': 'docs.infrahub.app'
    }, {
      src: '/js/custom-reo.js'
    }
  ] : [],

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
          editUrl: "https://github.com/opsmill/infrahub/tree/stable/docs",
          exclude: ["**/AGENTS.md", "tutorials/getting-started/**"],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/overview/schema',
            to: '/getting-started/overview',
          },
          {
            from: '/overview/versioning',
            to: '/getting-started/overview',
          },
          {
            from: '/overview/generators',
            to: '/getting-started/overview',
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
        ],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-bundle-dc',
        path: 'docs-bundle-dc',
        routeBasePath: 'bundle-dc',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-bundle-dc.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-emma',
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
        path: 'docs-mcp',
        routeBasePath: 'mcp',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-mcp.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-integrations',
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
        path: 'docs-backup',
        routeBasePath: 'backup',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-backup.ts',
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
        siteTitle: 'Infrahub Documentation',
        siteDescription: 'Comprehensive guide to Infrahub - the modern infrastructure management platform',
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
              sidebarId: "infrahubOpsSidebar",
              label: "Infrahub Backup",
              docsPluginId: "docs-backup",
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
          label: 'Demos & Examples',
          items: [
            {
              type: "docSidebar",
              sidebarId: "BundleDcSidebar",
              label: "DC Bundle",
              docsPluginId: "docs-bundle-dc",
            },
            {
              type: "docSidebar",
              sidebarId: "servicecatalogSidebar",
              label: "demo-service-catalog",
              docsPluginId: "docs-service-catalog",
            },
            {
              type: "docSidebar",
              sidebarId: "schemaSidebar",
              label: "Schema Library",
              docsPluginId: "docs-schema-library",
            },
          ],
        },
        {
          type: "search",
          position: "right",
        },
        {
          href: "https://github.com/opsmill/infrahub",
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
      // Ask AI configuration
      askAi: {
        assistantId: 'hh3YkWRV6fxH',
        indexName: 'Docs',  // Changed from 'Docs-markdown' to use same index
        appId: 'MKBNCZRNI3',
        apiKey: 'f12e2a9c8472d0f5287cc34715a24518',
      },
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
