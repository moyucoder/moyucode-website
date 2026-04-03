/** 站点 URL / GitHub 等，供 `astro.config`、`HomeLayout` 等引用。 */
export default {
  /** 本地默认同自定义域名；CI 可覆盖 `SITE_URL` */
  url: process.env.SITE_URL || "https://moyucode.cn",
  github: "https://github.com/moyucoder/moyucoder-website",
}

/**
 * 首页卡片默认封面（当某篇未写 `screen` 时）。
 * - `daily`：日刊默认；可为 `src/assets/` 相对路径、`images/…`（见 screen 说明），或 `https://...`。
 * - `blog`：`null` 表示默认灰块；单篇要图请在 frontmatter 写 `screen`。
 */
export const feedDefaults = {
  /** 日刊某篇未写 `screen` 时：空串用 SVG 占位；非空则相对 `src/assets/` */
  daily: "",
  blog: null,
}

/**
 * Giscus（GitHub Discussions 评论）：在 https://giscus.app 选择仓库与分类后，把生成的 id 填到这里。
 * 未填全 `repoId` / `categoryId` 时不会加载评论框（避免报错）。
 * 仓库需开启 Discussions，并安装 Giscus GitHub App（仅访问该仓库）。
 */
export const giscus = {
  repo: "moyucoder/moyucoder-website",
  repoId: "",
  category: "Announcements",
  categoryId: "",
  mapping: "pathname",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "bottom",
  lang: "zh-CN",
}
