import { ref, onMounted, onUnmounted } from 'vue'

export function getScrollClass(target = window) {
  const scrollClass = ref('top')

  const onScroll = () => {
    if (target === window) {
      scrollClass.value = window.scrollY === 0 ? 'top' : 'scrolled'
    } else if (target && target.scrollTop !== undefined) {
      scrollClass.value = target.scrollTop === 0 ? 'top' : 'scrolled'
    }
  }

  onMounted(() => {
    (target === window ? window : target).addEventListener('scroll', onScroll)
    onScroll()
  })

  onUnmounted(() => {
    (target === window ? window : target).removeEventListener('scroll', onScroll)
  })

  return scrollClass
}