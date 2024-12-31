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

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          editUrl: "https://github.com/opsmill/infrahub/tree/stable/docs",
          path: "docs",
          routeBasePath: "/",
          sidebarCollapsed: true,
          sidebarPath: "./sidebars.ts",
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
        id: 'demo',
        path: 'demo-dc-fabric',
        routeBasePath: 'demo',
        sidebarCollapsed: true,
        sidebarPath: './sidebars-demo.ts',
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
          type: 'dropdown',
          position: 'left',
          label: 'Projects',
          items: [
            {
              type: "docSidebar",
              sidebarId: "docsSidebar",
              label: "Infrahub Documentation",
            },
            {
              type: "docSidebar",
              sidebarId: "demoSidebar",
              label: "demo-dc-fabric",
              docsPluginId: "demo",
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
      ],
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} - <b>Infrahub</b> by OpsMill.`,
    },
    prism: {
      theme: prismThemes.oneDark,
      additionalLanguages: ["bash", "python", "markup-templating", "django", "json", "toml", "yaml"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
