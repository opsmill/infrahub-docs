import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

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
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-demo',
        path: 'docs-demo',
        routeBasePath: 'demo',
        sidebarCollapsed: false,
        sidebarPath: './sidebars-demo.ts',
        editUrl: "https://github.com/opsmill/infrahub-demo-dc-fabric/tree/main/docs",
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
        editUrl: "https://github.com/opsmill/emma/tree/main/docs",
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
        editUrl: "https://github.com/opsmill/nornir-infrahub/tree/main/docs",
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
              type: "doc",
              label: 'Python SDK Docs',
              docId: 'python-sdk/readme',
            },
          ],
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Integrations',
          items: [
            {
              type: "doc",
              label: 'Ansible',
              docId: 'integrations/infrahub-ansible/readme',
            },
            {
              type: "doc",
              label: 'infrahub-sync',
              docId: 'integrations/sync/readme',
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
};

export default config;
