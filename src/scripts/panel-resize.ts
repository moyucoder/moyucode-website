/** 日刊 / 博客：拖拽左侧菜单右缘、右侧目录左缘调整宽度，写入 localStorage */

const LS_SIDEBAR = "moyu-starlight-sidebar-width"
const LS_TOC = "moyu-starlight-toc-width"

function canonicalIsBlogOrDaily(): boolean {
  const href = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? ""
  return /\/blog\/|\/daily\//.test(href)
}

function rootRem(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function init() {
  if (!canonicalIsBlogOrDaily()) return
  const html = document.documentElement
  if (html.dataset.moyuPanelResizeInit === "1") return
  if (!html.hasAttribute("data-has-sidebar")) return

  html.dataset.moyuPanelResizeInit = "1"

  const mqSidebar = matchMedia("(min-width: 50rem)")
  const mqToc = matchMedia("(min-width: 72rem)")

  const minSb = () => 15 * rootRem()
  const maxSb = () => Math.min(38 * rootRem(), window.innerWidth * 0.42)
  const minToc = () => 13 * rootRem()
  const maxToc = () => Math.min(32 * rootRem(), window.innerWidth * 0.35)

  const rtl = () => html.dir === "rtl"
  /** LTR：向右拖加宽侧栏；RTL 时 X 反向 */
  const signX = () => (rtl() ? -1 : 1)

  function applySavedWidths() {
    const sb = localStorage.getItem(LS_SIDEBAR)
    if (sb && /^\d+(\.\d+)?px$/.test(sb)) {
      html.style.setProperty("--sl-sidebar-width", sb)
    }
    if (html.hasAttribute("data-has-toc")) {
      const toc = localStorage.getItem(LS_TOC)
      if (toc && /^\d+(\.\d+)?px$/.test(toc)) {
        html.style.setProperty("--sl-toc-column-width", toc)
      }
    }
  }

  /** 仅在已用内联 px 覆盖时收束到视口与阈值（避免首屏把 rem 默认值强行改成 px） */
  function clampStoredToViewport() {
    const rawSb = html.style.getPropertyValue("--sl-sidebar-width").trim()
    if (rawSb && mqSidebar.matches) {
      const cur = parseFloat(rawSb)
      if (!Number.isNaN(cur)) {
        const w = clamp(cur, minSb(), maxSb())
        html.style.setProperty("--sl-sidebar-width", `${w}px`)
        localStorage.setItem(LS_SIDEBAR, `${w}px`)
      }
    }
    const rawToc = html.style.getPropertyValue("--sl-toc-column-width").trim()
    if (rawToc && mqToc.matches && html.hasAttribute("data-has-toc")) {
      const cur = parseFloat(rawToc)
      if (!Number.isNaN(cur)) {
        const w = clamp(cur, minToc(), maxToc())
        html.style.setProperty("--sl-toc-column-width", `${w}px`)
        localStorage.setItem(LS_TOC, `${w}px`)
      }
    }
  }

  applySavedWidths()

  function attachSidebarHandle() {
    const pane = document.querySelector<HTMLElement>(".sidebar-pane")
    if (!pane || pane.querySelector(".moyu-panel-resize-handle--sidebar")) return

    const handle = document.createElement("div")
    handle.className = "moyu-panel-resize-handle moyu-panel-resize-handle--sidebar"
    handle.setAttribute("role", "separator")
    handle.setAttribute("aria-orientation", "vertical")
    handle.title = "拖拽调整左侧菜单宽度"
    handle.tabIndex = 0

    let startX = 0
    let startW = 0

    function onMove(e: PointerEvent) {
      if (!handle.hasPointerCapture(e.pointerId)) return
      const delta = (e.clientX - startX) * signX()
      const w = clamp(startW + delta, minSb(), maxSb())
      html.style.setProperty("--sl-sidebar-width", `${w}px`)
    }

    function endDrag(e: PointerEvent) {
      if (!handle.hasPointerCapture(e.pointerId)) return
      handle.releasePointerCapture(e.pointerId)
      document.body.style.removeProperty("user-select")
      const w = clamp(
        parseFloat(html.style.getPropertyValue("--sl-sidebar-width")) || startW,
        minSb(),
        maxSb(),
      )
      html.style.setProperty("--sl-sidebar-width", `${w}px`)
      localStorage.setItem(LS_SIDEBAR, `${w}px`)
    }

    handle.addEventListener("pointerdown", (e) => {
      if (!mqSidebar.matches || e.button !== 0) return
      e.preventDefault()
      startX = e.clientX
      startW = pane.getBoundingClientRect().width
      handle.setPointerCapture(e.pointerId)
      document.body.style.userSelect = "none"
    })
    handle.addEventListener("pointermove", onMove)
    handle.addEventListener("pointerup", endDrag)
    handle.addEventListener("pointercancel", endDrag)

    pane.appendChild(handle)
  }

  function attachTocHandle() {
    if (!html.hasAttribute("data-has-toc")) return
    const rs = document.querySelector<HTMLElement>(".right-sidebar")
    if (!rs || rs.querySelector(".moyu-panel-resize-handle--toc")) return

    const handle = document.createElement("div")
    handle.className = "moyu-panel-resize-handle moyu-panel-resize-handle--toc"
    handle.setAttribute("role", "separator")
    handle.setAttribute("aria-orientation", "vertical")
    handle.title = "拖拽调整本页目录宽度"
    handle.tabIndex = 0

    let startX = 0
    let startW = 0

    function onMove(e: PointerEvent) {
      if (!handle.hasPointerCapture(e.pointerId)) return
      /** LTR：向右拖加宽 TOC（与侧栏同向 signX） */
      const delta = (e.clientX - startX) * signX()
      const w = clamp(startW + delta, minToc(), maxToc())
      html.style.setProperty("--sl-toc-column-width", `${w}px`)
    }

    function endDrag(e: PointerEvent) {
      if (!handle.hasPointerCapture(e.pointerId)) return
      handle.releasePointerCapture(e.pointerId)
      document.body.style.removeProperty("user-select")
      const w = clamp(
        parseFloat(html.style.getPropertyValue("--sl-toc-column-width")) || startW,
        minToc(),
        maxToc(),
      )
      html.style.setProperty("--sl-toc-column-width", `${w}px`)
      localStorage.setItem(LS_TOC, `${w}px`)
    }

    handle.addEventListener("pointerdown", (e) => {
      if (!mqToc.matches || e.button !== 0) return
      e.preventDefault()
      startX = e.clientX
      const aside = document.querySelector<HTMLElement>(".right-sidebar-container")
      startW = aside?.getBoundingClientRect().width ?? startW
      handle.setPointerCapture(e.pointerId)
      document.body.style.userSelect = "none"
    })
    handle.addEventListener("pointermove", onMove)
    handle.addEventListener("pointerup", endDrag)
    handle.addEventListener("pointercancel", endDrag)

    rs.appendChild(handle)
  }

  function refreshHandlesVisibility() {
    document.querySelector<HTMLElement>(".moyu-panel-resize-handle--sidebar")?.style.setProperty(
      "display",
      mqSidebar.matches ? "" : "none",
    )
    document.querySelector<HTMLElement>(".moyu-panel-resize-handle--toc")?.style.setProperty(
      "display",
      mqToc.matches ? "" : "none",
    )
  }

  function setup() {
    attachSidebarHandle()
    attachTocHandle()
    refreshHandlesVisibility()
    clampStoredToViewport()
  }

  setup()

  mqSidebar.addEventListener("change", () => {
    refreshHandlesVisibility()
    clampStoredToViewport()
  })
  mqToc.addEventListener("change", () => {
    refreshHandlesVisibility()
    clampStoredToViewport()
  })

  let resizeT: number
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeT)
    resizeT = window.setTimeout(() => clampStoredToViewport(), 120)
  })
}

init()
