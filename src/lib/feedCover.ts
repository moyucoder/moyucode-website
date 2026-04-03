import type { ImageMetadata } from "astro"
import { feedDefaults } from "../../config.mjs"
import dailySvgFallback from "../assets/weekly/weekly-hero-scribble.svg?url"

export type FeedColumn = "daily" | "blog"

export type FeedVisual =
  | { kind: "raster"; src: ImageMetadata }
  | { kind: "svg"; src: string }
  | { kind: "remote"; src: string }
  | { kind: "none" }

const rasterModules = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/**/*.{png,jpg,jpeg,webp,avif,gif}",
  { eager: true, import: "default" },
)

/** 与某篇 md 同级的 `images/*`（`src/content/docs/...`） */
const contentDocImageModules = import.meta.glob<{ default: ImageMetadata }>(
  "../content/docs/**/*.{png,jpg,jpeg,webp,avif,gif}",
  { eager: true, import: "default" },
)

const svgUrlModules = import.meta.glob<string>("../assets/**/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
})

function assetKey(pathFromAssets: string): string {
  return `../assets/${pathFromAssets.replace(/^\/+/, "")}`
}

function rasterAt(pathFromAssets: string): ImageMetadata | undefined {
  return coalesceGlobImageModule(rasterModules[assetKey(pathFromAssets)])
}

function svgUrlAt(pathFromAssets: string): string | undefined {
  return svgUrlModules[assetKey(pathFromAssets)] as string | undefined
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim())
}

/** Vite `import: "default"` 常为直接导出；部分环境为 `{ default }`，需兼容 */
function coalesceGlobImageModule(value: unknown): ImageMetadata | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value !== "object") return undefined
  const o = value as Record<string, unknown>
  if ("src" in o) return value as ImageMetadata
  const d = o.default
  if (d && typeof d === "object" && "src" in (d as object)) return d as ImageMetadata
  return undefined
}

/** `blog/foo/bar` → `blog/foo` */
function docParentDir(docId: string): string {
  const i = docId.lastIndexOf("/")
  return i === -1 ? "" : docId.slice(0, i)
}

/**
 * `screen: images/a.jpg` 相对「该篇所在文件夹」：
 * - 日刊单文件：`daily/2026/03-24` → `daily/2026/images/…`
 * - 博客目录索引：`blog/cloud-native` → `blog/cloud-native/images/…`（不能用父级 `blog`）
 * 故先试 `docId/images/…`，再试 `docParentDir(docId)/images/…`。
 */
function contentDocRasterFromImagesPath(docId: string, normalizedCover: string): ImageMetadata | undefined {
  if (!normalizedCover.startsWith("images/")) return undefined
  const parent = docParentDir(docId)
  const candidates = [
    `../content/docs/${docId}/${normalizedCover}`,
    ...(parent ? [`../content/docs/${parent}/${normalizedCover}`] : []),
  ]
  for (const key of candidates) {
    const raster = coalesceGlobImageModule(contentDocImageModules[key])
    if (raster) return raster
  }
  return undefined
}

/** 本地路径相对 `src/assets/`；找不到返回 null */
function resolveLocalPath(pathFromAssets: string): FeedVisual | null {
  if (pathFromAssets.endsWith(".svg")) {
    const url = svgUrlAt(pathFromAssets)
    return url ? { kind: "svg", src: url } : null
  }
  const raster = rasterAt(pathFromAssets)
  return raster ? { kind: "raster", src: raster } : null
}

/**
 * 解析单条 `screen` 或默认图字符串：`https?://` 为外链；
 * `images/…`（相对该篇所在目录）→ `src/content/docs/<父目录>/images/…`；
 * 其余按 `src/assets/` 下路径。
 */
function resolveFeedCoverString(
  raw: string,
  column: FeedColumn,
  docId?: string,
): FeedVisual {
  const t = raw.trim()
  if (!t) {
    if (column === "blog") return { kind: "none" }
    const def = typeof feedDefaults.daily === "string" ? feedDefaults.daily.trim() : ""
    if (!def) return { kind: "svg", src: dailySvgFallback }
    return resolveFeedCoverString(def, "daily")
  }

  if (isHttpUrl(t)) return { kind: "remote", src: t.trim() }

  const normalized = t.replace(/^\/+/, "").replace(/^\.\/+/, "")

  if (docId) {
    const raster = contentDocRasterFromImagesPath(docId, normalized)
    if (raster) return { kind: "raster", src: raster }
  }

  const local = resolveLocalPath(normalized)
  if (local) return local

  if (column === "blog") return { kind: "none" }
  return { kind: "svg", src: dailySvgFallback }
}

/** 首页卡片：frontmatter `screen` 优先；博客无则用灰块；日刊无则用 `config.mjs` → `feedDefaults.daily` */
export function resolveFeedVisual(
  screen: string | undefined,
  column: FeedColumn,
  docId?: string,
): FeedVisual {
  const primary = screen?.trim() ?? ""
  if (column === "blog") {
    if (!primary) return { kind: "none" }
    return resolveFeedCoverString(primary, "blog", docId)
  }
  if (!primary) return resolveFeedCoverString("", "daily")
  return resolveFeedCoverString(primary, "daily", docId)
}
