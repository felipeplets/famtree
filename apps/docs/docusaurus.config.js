// @ts-check
// Docusaurus configuration for the famtree documentation site.
// Plain JS config on purpose: the repo root pins TypeScript 7 (Go-based), whose
// compiler the Docusaurus TS-config loader (classic tsc/ts-node) can't use.
// Docs-only mode — the docs live at the site root ("/").

import { themes as prismThemes } from "prism-react-renderer"

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "famtree",
  tagline: "Render genogram JSON documents to clean, standards-based SVG.",
  favicon: "img/favicon.svg",

  url: "https://felipeplets.github.io",
  baseUrl: "/famtree/",

  organizationName: "felipeplets",
  projectName: "famtree",
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          editUrl: "https://github.com/felipeplets/famtree/edit/main/apps/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/social-card.svg",
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "famtree",
        logo: {
          alt: "famtree logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "docsSidebar",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://www.npmjs.com/package/@famtree/cli",
            label: "npm",
            position: "right",
          },
          {
            href: "https://github.com/felipeplets/famtree",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              { label: "Getting started", to: "/guides/getting-started" },
              { label: "The genogram document", to: "/guides/document" },
              { label: "Schema reference", to: "/reference/schema" },
              { label: "CLI reference", to: "/reference/cli" },
            ],
          },
          {
            title: "Community",
            items: [
              { label: "Issues", href: "https://github.com/felipeplets/famtree/issues" },
              { label: "Discussions", href: "https://github.com/felipeplets/famtree/discussions" },
            ],
          },
          {
            title: "More",
            items: [
              { label: "npm", href: "https://www.npmjs.com/package/@famtree/cli" },
              { label: "GitHub", href: "https://github.com/felipeplets/famtree" },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Felipe Plets. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ["bash", "json"],
      },
    }),
}

export default config
