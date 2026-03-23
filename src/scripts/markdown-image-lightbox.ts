/** 博客 / 周刊正文内图片：点击全屏预览，Esc 或点遮罩 / 关闭按钮 */

function canonicalIsBlogOrWeekly(): boolean {
  const href = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? ""
  return /\/blog\/|\/weekly\//.test(href)
}

let layer: HTMLDivElement | null = null
let layerImg: HTMLImageElement | null = null

function onEscape(e: KeyboardEvent) {
  if (e.key === "Escape") closeLightbox()
}

function closeLightbox() {
  if (!layer) return
  layer.classList.remove("is-open")
  document.body.style.overflow = ""
  document.removeEventListener("keydown", onEscape)
}

function openLightbox(src: string, alt: string) {
  if (!layer) {
    layer = document.createElement("div")
    layer.id = "md-img-lightbox"
    layer.className = "md-img-lightbox"
    layer.setAttribute("role", "dialog")
    layer.setAttribute("aria-modal", "true")
    layer.setAttribute("aria-label", "图片预览")
    layer.innerHTML = `
      <button type="button" class="md-img-lightbox__backdrop" aria-label="关闭预览"></button>
      <img class="md-img-lightbox__img" alt="" decoding="async" />
      <button type="button" class="md-img-lightbox__close" aria-label="关闭">×</button>
    `
    document.body.appendChild(layer)

    layerImg = layer.querySelector(".md-img-lightbox__img") as HTMLImageElement
    layer.querySelector(".md-img-lightbox__backdrop")?.addEventListener("click", closeLightbox)
    layer.querySelector(".md-img-lightbox__close")?.addEventListener("click", closeLightbox)
  }

  if (!layerImg) return
  layerImg.src = src
  layerImg.alt = alt
  layer.classList.add("is-open")
  document.body.style.overflow = "hidden"
  document.removeEventListener("keydown", onEscape)
  document.addEventListener("keydown", onEscape)
}

function init() {
  if (!canonicalIsBlogOrWeekly()) return

  const root = document.querySelector("main .sl-markdown-content")
  if (!root) return

  root.querySelectorAll("img").forEach((el) => {
    const img = el as HTMLImageElement
    if (img.closest(".not-content") || img.classList.contains("md-content-img--no-lightbox")) return

    img.classList.add("md-content-img--zoomable")
    img.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      const src = img.currentSrc || img.src
      if (!src) return
      openLightbox(src, img.alt || "")
    })
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
