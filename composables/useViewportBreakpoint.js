import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable for a reactive viewport-width breakpoint check via matchMedia.
 *
 * Unlike useMobileDetection (a static User-Agent sniff, taken once on
 * mount), this tracks live resizes -- the more correct signal for a
 * responsive *behavior* decision (e.g. "should clicking a menu item close
 * the menu"), as opposed to pure layout/styling, which should stay in CSS
 * media queries rather than JS.
 *
 * @param {number} maxWidth - viewport width in px at or below which
 *   isSmall is true. Default 768 matches mini's own --screen-md
 *   (css/scss/_vars.scss).
 * @returns {Object} { isSmall }
 */
export function useViewportBreakpoint(maxWidth = 768) {
  const isSmall = ref(false)
  let mql = null

  const update = () => {
    isSmall.value = mql.matches
  }

  onMounted(() => {
    mql = window.matchMedia(`(max-width: ${maxWidth}px)`)
    update()
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  return { isSmall }
}
