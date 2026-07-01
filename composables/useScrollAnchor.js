import { nextTick } from 'vue'

// Wraps a DOM-mutating action so the viewport stays visually anchored to
// `elRef` even if the action shrinks or grows content elsewhere on the
// page. Without this, toggling something that hides a lot of content
// while scrolled down can leave the document shorter than the current
// scroll offset — the browser then clamps scrollY, which looks like an
// unwanted jump back up the page. `elRef` can be a plain DOM element ref
// or a component ref (its `.$el` is used in that case).
export function useScrollAnchor(elRef) {
  return async function withScrollAnchor(action) {
    const el = elRef.value?.$el ?? elRef.value
    const before = el?.getBoundingClientRect().top

    action()
    await nextTick()

    if (before == null || !el) return
    const after = el.getBoundingClientRect().top
    if (after !== before) window.scrollBy(0, after - before)
  }
}
