import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable for scroll detection and tracking
 * @param {number} threshold - Scroll threshold in pixels (default: 80)
 * @returns {Object} Scroll detection utilities
 */
export function useScrollDetection(threshold = 80) {
  const isScrolled = ref(false)
  const isTop = ref(true)
  const scrollY = ref(0)
  const scrollDirection = ref('none') // 'up', 'down', or 'none'
  const lastScrollTop = ref(0)

  const updateScrollState = () => {
    scrollY.value = window.pageYOffset || document.documentElement.scrollTop

    // Update top/scrolled state
    if (scrollY.value < threshold) {
      isScrolled.value = false
      isTop.value = true
    } else {
      isScrolled.value = true
      isTop.value = false
    }

    // Update scroll direction
    if (scrollY.value > lastScrollTop.value) {
      scrollDirection.value = 'down'
    } else if (scrollY.value < lastScrollTop.value) {
      scrollDirection.value = 'up'
    }

    lastScrollTop.value = scrollY.value <= 0 ? 0 : scrollY.value
  }

  onMounted(() => {
    updateScrollState()
    window.addEventListener('scroll', updateScrollState)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateScrollState)
  })

  return {
    isScrolled,
    isTop,
    scrollY,
    scrollDirection,
    updateScrollState
  }
}
