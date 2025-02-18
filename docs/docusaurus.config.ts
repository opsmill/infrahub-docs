import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import globalVars from './globalVars'

const config: Config = {
  title: "Infrahub Documentation",
  tagline: "Explore our guides and examples to use Infrahub.",
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

  // Set the production url of your site here
  url: process.env.DOCS_IN_APP ? "http://localhost:8000" : "https://docs.infrahub.app",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: process.env.DOCS_IN_APP ? "/docs/" : "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "opsmill", // Usually your GitHub org/user name.
  projectName: "infrahub", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  onBrokenMarkdownLinks: "throw",
  onDuplicateRoutes: "throw",
  noIndex: false,

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
        id: 'docs-demo',
        path: 'docs-demo',
        routeBasePath: 'demo',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-demo.ts',
        // editUrl: "https://github.com/opsmill/infrahub-demo-dc-fabric/tree/main/docs",
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
        // editUrl: "https://github.com/opsmill/emma/tree/main/docs",
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
        // editUrl: "https://github.com/opsmill/nornir-infrahub/tree/main/docs",
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
        // editUrl: "https://github.com/opsmill/infrahub-sync/tree/main/docs",
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
        // editUrl: "https://github.com/opsmill/infrahub-ansible/tree/main/docs",
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
        // editUrl: "https://github.com/opsmill/schema-library/tree/main/docs",
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-python-sdk',
        path: 'docs-python-sdk',
        routeBasePath: 'python-sdk',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-python-sdk.ts',
        // editUrl: "https://github.com/opsmill/infrahub-python-sdk/main/docs",
      },
    ],
  ],
  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        indexBlog: false,
        indexDocs: true,
        docsRouteBasePath: "/", // this needs to be the same as routeBasePath
        hashed: true,
      }
    ],
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
          label: 'Python SDK',
          items: [
            {
              type: "docSidebar",
              sidebarId: "PythonSdkSidebar",
              label: "Python SDK Docs",
              docsPluginId: "docs-python-sdk",
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
              sidebarId: "ansibleSidebar",
              label: "Ansible",
              docsPluginId: "docs-ansible",
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
              sidebarId: "demoSidebar",
              label: "demo-dc-fabric",
              docsPluginId: "docs-demo",
            },
            {
              type: "docSidebar",
              sidebarId: "emmaSidebar",
              label: "Emma Experimental Agent",
              docsPluginId: "docs-emma",
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
  } satisfies Preset.ThemeConfig,

  markdown: {
    format: "mdx",
    preprocessor: ({ filePath, fileContent }) => {
      console.log(`Processing ${filePath}`);
      const transformedContent = fileContent.replace(/\$\(\s*(\w+)\s*\)/g, (match, variableName) => {
        return globalVars[variableName] || match;
      });

      return transformedContent;
    },
  },
};

export default config;
