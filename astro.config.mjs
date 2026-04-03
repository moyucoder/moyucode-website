// @ts-check
import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"
import config from "./config.mjs"
import { baiduTongjiHeadEntry } from "./src/constants/baidu-tongji.mjs"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

const basePath = (process.env.BASE_PATH || "").replace(/\/$/, "") || undefined

// https://astro.build/config
export default defineConfig({
  site: config.url,
  ...(basePath ? { base: basePath } : {}),
  output: "static",
  trailingSlash: "always",
  /**
   * 大尺寸 / 多帧 GIF 等会触发 Sharp 默认 `limitInputPixels`，导致构建报错且正文图不生成。
   * 站点内容为自建仓库，可关闭像素上限；若担心内存可改为极大数值而非 `false`。
   */
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        limitInputPixels: false,
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
  server: {
    host: "0.0.0.0",
  },
  /**
   * 绑定 0.0.0.0 时，Vite 默认可能用「某块网卡」的地址做 HMR WebSocket（多网卡 / VPN 常见），
   * 浏览器端连不上则不会收到 full-reload，改 md 后页面不刷新。固定用本机回环即可恢复。
   * 若需在另一台设备上开页面并要热更新，可临时去掉 hmr.host 或改为该机可达的 IP。
   */
  vite: {
    server: {
      hmr: {
        protocol: "ws",
        host: "127.0.0.1",
      },
    },
  },
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
  },
  integrations: [
    starlight({
      title: "摸鱼编程",
      components: {
        Header: "./src/components/StarlightHeader.astro",
        SiteTitle: "./src/components/StarlightSiteTitle.astro",
        Footer: "./src/components/Footer.astro",
        PageTitle: "./src/components/StarlightPageTitle.astro",
      },
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN",
          dir: "ltr",
        },
      },
      favicon: "/logo.png",
      head: [baiduTongjiHeadEntry],
      pagefind: false,
      lastUpdated: true,
      expressiveCode: { themes: ["github-light", "github-dark"] },
      social: [{ icon: "github", label: "GitHub", href: config.github }],
      editLink: {
        baseUrl: `${config.github}/edit/main/`,
      },
      markdown: {
        headingLinks: false,
      },
      /** 右侧「本页目录」默认只到 h3；日刊/博客常用 #### 作条目标题，需纳入锚点 */
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      customCss: ["./src/styles/starlight-brand.css", "./src/styles/ide-chrome.css"],
      logo: {
        light: "./src/assets/logo-light.png",
        dark: "./src/assets/logo-dark.png",
        replacesTitle: true,
      },
      /**
       * 博客侧栏：博客首页与两个栏目均为顶层一级（不再包在「文档」分组下）。
       */
      sidebar: [
        { slug: "blog", label: "摸鱼编程博客" },
        {
          label: "从 0 开始学 Agent",
          collapsed: false,
          autogenerate: { directory: "blog/agent" },
        },
        {
          label: "前端",
          collapsed: false,
          autogenerate: { directory: "blog/frontend" },
        },
        {
          label: "工具",
          collapsed: true,
          autogenerate: { directory: "blog/tool" },
        },
        {
          label: "云原生",
          collapsed: true,
          autogenerate: { directory: "blog/cloud-native" },
        },
        {
          label: "思考",
          collapsed: true,
          autogenerate: { directory: "blog/thinking" },
        },
      ],
      sidebarByLocale: {
        daily: [
          { slug: "daily", label: "日刊" },
          {
            label: "2026",
            collapsed: false,
            autogenerate: { directory: "daily/2026" },
          },
          {
            label: "2020",
            collapsed: true,
            autogenerate: { directory: "daily/2020" },
          },
          {
            label: "2016",
            collapsed: true,
            autogenerate: { directory: "daily/2016" },
          },
        ],
      },
    }),
  ],
})
