/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'TSRPC - 专为 TypeScript 设计的 RPC 框架',
  tagline: '专为 TypeScript 设计的 RPC 框架，经千万级用户验证\n适用于 HTTP API、WebSocket 实时应用、NodeJS 微服务等',
  url: 'https://tsrpc.cn',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'k8w', // Usually your GitHub org/user name.
  projectName: 'tsrpc', // Usually your repo name.
  themeConfig: {
    algolia: {
      appId: 'NOAY1RDDDM',
      apiKey: '27d8b5642756e4dd9ea5f2f3ebfde8c6',
      indexName: 'tsrpc_cn',
      contextualSearch: true
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false
    },
    navbar: {
      title: 'TSRPC',
      // logo: {
      //   alt: 'TSRPC',
      //   src: 'img/logo.svg',
      // },
      items: [
        {
          type: 'doc',
          docId: 'docs/introduction.html',
          position: 'left',
          label: '文档',
        },
        {
          href: '/docs/server/install.html',
          position: 'left',
          label: '服务端',
        },
        {
          href: '/docs/client/install.html',
          position: 'left',
          label: '客户端',
        },
        {
          href: 'https://github.com/k8w/tsrpc-examples',
          target: '_blank',
          position: 'left',
          label: '示例',
        },
        // {
        //   type: 'doc',
        //   docId: 'api/index',
        //   position: 'left',
        //   label: 'API',
        // },
        // {
        //   type: 'doc',
        //   docId: 'cookbook/index',
        //   position: 'left',
        //   label: '示例',
        // },
        { to: '/blog', label: '博客', position: 'left' },
        {
          label: 'v3.2.0', // by default, show active/latest version label
          position: 'right'
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
      copyright: `<img src="/img/wechat.png" /><p>遵循 MIT 开源协议 &nbsp;&nbsp; Copyright © 2016-${new Date().getFullYear()} King Wang &nbsp;&nbsp; <a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备17160324号</a></p>`,
    },
    gtag: {
      // You can also use your "G-" Measurement ID here.
      trackingID: 'G-D8LMPPSZ18',
      // Optional fields.
      anonymizeIP: false, // Should IPs be anonymized?
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
        blog: {
          include: ['**/*.{md,mdx}'],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    function baiduTongJi(context, options) {
      if (process.env.NODE_ENV !== 'production') {
        return {};
      }
      return {
        name: 'docusaurus-plugin-baidu-analytics',
        injectHtmlTags() {
          return {
            headTags: [
              {
                tagName: 'script',
                innerHTML: `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?7a7860c000f3d668629961930969eef2";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();`,
              },
            ],
          };
        },
      };
    }
  ],
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  }
};
