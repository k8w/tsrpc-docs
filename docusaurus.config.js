/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'TSRPC - 领先的 TypeScript RPC 开源框架',
  tagline: '领先的 TypeScript RPC 开源框架\n比 JSON 更强大，类型安全，支持二进制\n全栈架构，前后端无感连接',
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
          label: 'v3.0.8', // by default, show active/latest version label
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
      copyright: `欢迎加群交流（微信 <b style="color: orange">LoyalSun</b>，请注明来意） <br/>遵循 MIT 开源协议 &nbsp;&nbsp; Copyright © 2016-${new Date().getFullYear()} King Wang &nbsp;&nbsp; <a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备17160324号</a>`,
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
  ]
};
