import { docsLoader } from "@astrojs/starlight/loaders"
import { docsSchema } from "@astrojs/starlight/schema"
import { defineCollection, z } from "astro:content"

/** 未写或空串的 title / description 在解析前补全，以满足展示与排序约定 */
function applyTitleDescriptionDefaults(raw: unknown): unknown {
  if (raw && typeof raw === "object") {
    const o = { ...(raw as Record<string, unknown>) }
    let title = o.title
    if (title === undefined || title === null || String(title).trim() === "") title = "未设置标题"
    else title = String(title).trim()
    o.title = title
    const desc = o.description
    if (desc === undefined || desc === null || String(desc).trim() === "") o.description = title
    else o.description = String(desc).trim()
    return o
  }
  return raw
}

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: (context) =>
      z.preprocess(
        applyTitleDescriptionDefaults,
        docsSchema({
          extend: z.object({
            /**
             * 首页卡片封面：`images/…` 表示与该篇 md 同级的 `images/` 目录；
             * 或 `src/assets/` 下相对路径；或 `https://...`。
             */
            /** 空键 `screen:` 在 YAML 里为 `null`，需与 optional 同时允许 null */
            screen: z.string().nullish(),
            /** 为 `true` 时优先排在首页「博客」栏前部；其余按 `createAt` 倒序补足 */
            homeFeed: z.boolean().optional(),
            /** 创建时间；未设置时在侧栏与首页排序中置于最后 */
            createAt: z.coerce.date().optional(),
            /**
             * 子目录的 `index` 页可设：侧栏折叠分组标题（目录文件夹名用英文 slug，URL 无中文）。
             * 见 `navigation.ts` patch `sidebarGroupLabelFromDir`。
             */
            sidebarGroupLabel: z.string().optional(),
          }),
        })(context),
      ),
  }),
}
