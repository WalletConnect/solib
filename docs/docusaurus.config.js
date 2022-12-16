// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Solib',
  tagline: 'Friendly Solana API ',
  url: 'https://solib.dev/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'walletconnect',
  projectName: 'solib',
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  scripts: [{src: 'https://plausible.io/js/plausible.js', defer: true, 'data-domain': 'solib.dev'}],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
          'https://github.com/WalletConnect/solib/tree/development/docs',
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        },
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Solib',
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs'
          },
          {
            href: 'https://github.com/walletconnect/solib',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/'
              }
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/solib'
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/walletconnect'
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/walletconnect'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/walletconnect/solib'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} WalletConnect, Inc.`
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      },
      algolia: {
        appId: "5FPHHB04CT",
        apiKey: "cde5ebe0be71faf99d8d5be3de33b96e",
        indexName: "solib",
        contextualSearch: true,
      },
    })
}

module.exports = config
