import { ref, onMounted, onUnmounted, watch } from 'vue'

/**
 * Reactive width (in px) of a DOM element, kept live via ResizeObserver --
 * the JS-side equivalent of a CSS container query, for a *behavior*
 * decision that needs to know an element's own rendered width (not the
 * viewport's -- see useViewportBreakpoint for that) and can't be expressed
 * in CSS alone (e.g. picking which of several width options would even
 * render differently right now -- see boxWidth.js's distinctBoxSizes).
 *
 * @param {import('vue').Ref<HTMLElement|import('vue').ComponentPublicInstance|null>} elRef -
 *   template ref to observe -- a plain DOM element, or a component (its
 *   root element, via the standard $el instance property, is used; this
 *   works regardless of whether that component calls defineExpose, since
 *   $el is a built-in instance property, not something expose controls)
 * @returns {import('vue').Ref<number>} live width in px, 0 until mounted/measured
 */
export function useElementWidth(elRef) {
  const width = ref(0)
  let observer = null

  function observe(target) {
    observer?.disconnect()
    const el = target?.$el ?? target
    if (!el) return
    observer = new ResizeObserver(([entry]) => {
      width.value = entry.contentRect.width
    })
    observer.observe(el)
    width.value = el.getBoundingClientRect().width
  }

  onMounted(() => observe(elRef.value))
  watch(elRef, observe)
  onUnmounted(() => observer?.disconnect())

  return width
}
