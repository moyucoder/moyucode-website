import { existsSync, statSync } from "node:fs"
import { join } from "node:path"

function docFilePath(id: string): string {
  const base = join(process.cwd(), "src/content/docs", id)
  if (existsSync(`${base}.mdx`)) return `${base}.mdx`
  return `${base}.md`
}

export function mtimeMs(id: string): number {
  try {
    return statSync(docFilePath(id)).mtimeMs
  } catch {
    return 0
  }
}

type WithPublished = { id: string; data: { publishedAt?: Date | string } }

/** 解析 frontmatter `publishedAt`（Date 或 YAML 日期字符串） */
function publishedAtMs(entry: WithPublished): number | null {
  const p = entry.data.publishedAt
  if (p instanceof Date && !Number.isNaN(p.getTime())) return p.getTime()
  if (typeof p === "string" && p.trim()) {
    const t = new Date(p).getTime()
    if (!Number.isNaN(t)) return t
  }
  return null
}

/** 首页展示/排序时间：优先 `publishedAt`，否则回退文件 mtime */
export function publishedOrMtimeMs(entry: WithPublished): number {
  return publishedAtMs(entry) ?? mtimeMs(entry.id)
}

/** 从 `weekly/weekly-12` 解析期号，用于首页周刊排序 */
export function weeklyIssueNum(id: string): number {
  const m = id.match(/weekly-(\d+)$/)
  return m ? parseInt(m[1], 10) : -1
}

/** 文档路由（含 GitHub Pages 子路径时的 `import.meta.env.BASE_URL`） */
export function hrefForDocId(id: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}${id}/`
}

export function formatDate(ms: number): string {
  if (!ms) return ""
  return new Date(ms).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

/** `YYYY-MM-DD` for `<time datetime>` */
export function isoDate(ms: number): string {
  if (!ms) return ""
  return new Date(ms).toISOString().slice(0, 10)
}
