import { ref, computed, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 0
}

export function useScrollState() {
  onMounted(() => window.addEventListener('scroll', onScroll))
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
  const scrollClass = computed(() => (isScrolled.value ? 'scrolled' : 'top'))
  return { scrollClass }
}