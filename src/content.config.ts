import { docsLoader } from "@astrojs/starlight/loaders"
import { docsSchema } from "@astrojs/starlight/schema"
import { defineCollection, z } from "astro:content"

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** 周刊期号展示用（如 `2026 · 第 1 期`）；博客可不写 */
        weeklyLabel: z.string().optional(),
        /**
         * 首页卡片封面：可为 `src/assets/` 下相对路径（如 `weekly/weekly-01-01.jpeg`），
         * 或 `https://...` 外链。与 `weeklyLabel` 并列各写一行即可。
         */
        feedCover: z.string().optional(),
        /** 为 `true` 时优先排在首页「博客」栏前部；不足 20 条时其余文章按 `publishedAt` 倒序补足 */
        homeFeed: z.boolean().optional(),
        /** 首页卡片日期与排序依据（时间倒序）；YAML 可写 `2026-03-21` */
        publishedAt: z.coerce.date().optional(),
        /**
         * 子目录的 `index` 页可设：侧栏折叠分组标题（目录文件夹名用英文 slug，URL 无中文）。
         * 见 `navigation.ts` patch `sidebarGroupLabelFromDir`。
         */
        sidebarGroupLabel: z.string().optional(),
      }),
    }),
  }),
}
