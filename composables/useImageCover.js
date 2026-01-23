import { onMounted, onUnmounted } from 'vue'

/**
 * Composable for making images/media cover their parent container
 * @returns {Object} Image cover utilities
 */
export function useImageCover() {
  /**
   * Apply cover styling to elements
   * @param {string} target - CSS selector for elements to cover (default: '.media-cover')
   */
  const applyCover = (target = '.media-cover') => {
    const elements = document.querySelectorAll(target)

    elements.forEach(element => {
      element.style.position = 'absolute'
      element.style.top = '50%'
      element.style.left = '50%'
      element.style.transform = 'translate(-50%, -50%)'

      const elementWrapper = element.parentNode
      if (!elementWrapper) return

      const imageWidth = element.offsetWidth
      const imageHeight = element.offsetHeight
      const parentWidth = elementWrapper.offsetWidth
      const parentHeight = elementWrapper.offsetHeight

      const wrapperRatio = parentWidth / parentHeight
      const imgRatio = imageWidth / imageHeight

      elementWrapper.style.overflow = 'hidden'
      elementWrapper.style.position = 'relative'

      // Horizontal or square wrapper
      if (wrapperRatio >= 1) {
        if (imgRatio < 1) {
          // Vertical image
          element.style.width = '100%'
          element.style.height = 'auto'
        } else {
          // Horizontal or square image
          if (imgRatio >= wrapperRatio) {
            element.style.width = 'auto'
            element.style.height = '100%'
          } else {
            element.style.width = '100%'
            element.style.height = 'auto'
          }
        }
      } else {
        // Vertical wrapper
        if (imgRatio >= 1) {
          // Horizontal or square image
          element.style.width = 'auto'
          element.style.height = '100%'
        } else {
          // Vertical image
          if (imgRatio < wrapperRatio) {
            element.style.width = '100%'
            element.style.height = 'auto'
          } else {
            element.style.width = 'auto'
            element.style.height = '100%'
          }
        }
      }
    })
  }

  /**
   * Set minimum height for full HD ratio (16:9)
   * @param {string} target - CSS selector (default: '.full-hd')
   */
  const applyFullHdRatio = (target = '.full-hd') => {
    const elements = document.querySelectorAll(target)
    elements.forEach(element => {
      element.style.minHeight = (element.offsetWidth * 0.5625) + 'px'
    })
  }

  const handleResize = () => {
    applyCover()
    applyFullHdRatio()
  }

  onMounted(() => {
    applyCover()
    applyFullHdRatio()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    applyCover,
    applyFullHdRatio
  }
}
