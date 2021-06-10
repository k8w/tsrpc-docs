/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'TSRPC - TypeScript 跨平台 RPC 框架',
  tagline: 'TypeScript 的跨平台 RPC 框架，支持运行时类型检查和二进制序列化',
  url: 'https://tsrpc.cn',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'k8w', // Usually your GitHub org/user name.
  projectName: 'tsrpc', // Usually your repo name.
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: true
    },
    navbar: {
      title: 'TSRPC',
      logo: {
        alt: 'TSRPC',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'docs/introduction',
          position: 'left',
          label: '文档',
        },
        {
          type: 'doc',
          docId: 'api/index',
          position: 'left',
          label: 'API',
        },
        {
          type: 'doc',
          docId: 'cookbook/index',
          position: 'left',
          label: '示例',
        },
        // { to: '/blog', label: 'Blog', position: 'left' },
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://github.com/k8w/tsrpc',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      // links: [
      //   {
      //     title: 'Docs',
      //     items: [
      //       {
      //         label: 'Tutorial',
      //         to: 'docs/introduction',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'Community',
      //     items: [
      //       {
      //         label: 'Stack Overflow',
      //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //       },
      //       {
      //         label: 'Discord',
      //         href: 'https://discordapp.com/invite/docusaurus',
      //       },
      //       {
      //         label: 'Twitter',
      //         href: 'https://twitter.com/docusaurus',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'Blog',
      //         to: '/blog',
      //       },
      //       {
      //         label: 'GitHub',
      //         href: 'https://github.com/facebook/docusaurus',
      //       },
      //     ],
      //   },
      // ],
      copyright: `遵循 MIT 开源协议  Copyright © 2016-${new Date().getFullYear()} King Wang`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // editUrl:
          //   'https://github.com/k8w/tsrpc-docs/blob/main/',
          routeBasePath: '/'
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // editUrl:
        //   //   'https://github.com/k8w/tsrpc-docs/blob/main/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
