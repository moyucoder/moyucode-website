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

type WithCreateAt = { id: string; data: { createAt?: Date | string } }

/** 解析 frontmatter `createAt`（Date 或 YAML 日期字符串） */
function createAtMs(entry: WithCreateAt): number | null {
  const p = entry.data.createAt
  if (p instanceof Date && !Number.isNaN(p.getTime())) return p.getTime()
  if (typeof p === "string" && p.trim()) {
    const t = new Date(p).getTime()
    if (!Number.isNaN(t)) return t
  }
  return null
}

/** 首页卡片等展示用时间：有 `createAt` 用其时间，否则回退文件 mtime（仅展示，不参与「无日期排最后」的排序） */
export function displayTimeMs(entry: WithCreateAt): number {
  return createAtMs(entry) ?? mtimeMs(entry.id)
}

/** 侧栏/首页：按 `createAt` 倒序，无日期排最后；同日再比 id */
export function compareCreateAtDescNullsLast(
  a: WithCreateAt,
  b: WithCreateAt,
): number {
  const ma = createAtMs(a)
  const mb = createAtMs(b)
  if (ma === null && mb === null) return b.id.localeCompare(a.id)
  if (ma === null) return 1
  if (mb === null) return -1
  if (mb !== ma) return mb - ma
  return b.id.localeCompare(a.id)
}

/** `daily/2026/…` 下的日刊正文（排除各级 index） */
export function isDailyIssueDocId(id: string): boolean {
  return /^daily\/\d{4}\//u.test(id) && !id.endsWith("/index")
}

/** `createAt` 对应的 `YYYY-MM-DD`，无则空串 */
export function createAtIsoDate(entry: WithCreateAt): string {
  const ms = createAtMs(entry)
  return ms === null ? "" : isoDate(ms)
}

/** `createAt` → 「3月20日」，无则空串 */
export function createAtZhMonthDay(entry: WithCreateAt): string {
  const iso = createAtIsoDate(entry)
  if (!iso) return ""
  const [, m, d] = iso.split("-")
  return `${parseInt(m, 10)}月${parseInt(d, 10)}日`
}

/** 日刊页 H1：与同页侧栏 `moyuDailySidebarLinkLabel` 一致，去掉前缀「M月d日」及紧随的中文冒号（若有）。 */
export function dailyHeadingTitle(
  id: string,
  data: { title?: string; createAt?: Date | string; sidebar?: { label?: string } },
): string {
  if (!isDailyIssueDocId(id)) return (data.title ?? "") as string

  const rawLabel =
    typeof data.sidebar?.label === "string" ? data.sidebar.label.trim() : ""
  if (rawLabel !== "") {
    const rest = rawLabel.replace(/^\d{1,2}月\d{1,2}日：?/, "").trim()
    if (rest !== "") return rest
    return ((data.title ?? "") as string).trim()
  }

  return ((data.title ?? "") as string).trim()
}

/** 首页日刊卡片：`M月d日` + 中文冒号 + `title`（侧栏同逻辑见 Starlight navigation patch） */
export function dailyCardMenuTitle(id: string, data: { title?: string; createAt?: Date | string }): string {
  if (!isDailyIssueDocId(id)) return (data.title ?? "") as string
  const md = createAtZhMonthDay({ id, data })
  const t = (data.title ?? "") as string
  return md ? `${md}：${t}` : t
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
