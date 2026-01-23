<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

const props = defineProps({
  menuToggleOnClick: {
    type: [Boolean],
    default: false
  },
  direction: {
    type: [String],
    default: 'row'
  },
  invert: {
    type: [Boolean],
    default: null
  }
})

const directionClass = computed(() => {
  const classes = []
  if (props.direction === 'row') {
    classes.push('row')
  }
  return classes
})

const menuClass = computed(() => {
  const classes = [ scrollClass.value, menuStateClass.value ]
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})

const menuItems = ref([])
const activeSection = ref(null)

function updateMenuItems() {
  menuItems.value = []
  const sections = document.querySelectorAll('section.page-menu')
  if (sections.length > 0) {
    for (let section of sections) {
      menuItems.value.push({
        title: section.getAttribute('title'),
        link: '#' + section.id,
        id: section.id
      })
    }
  }
}

// Intersection Observer to track active section
let observer = null
function observeSections() {
  if (observer) observer.disconnect()
  const sections = document.querySelectorAll('section.page-menu')
  observer = new window.IntersectionObserver(
    (entries) => {
      // Find the first section that is intersecting (visible)
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible.length > 0) {
        activeSection.value = visible[0].target.id
      } else {
        activeSection.value = null // Remove active if none is visible
      }
    },
    {
      threshold: [0.3, 0.6, 1.0],
      rootMargin: '0px 0px -40% 0px'
    }
  )
  sections.forEach(section => observer.observe(section))
}

const route = useRoute()

onMounted(() => {
  setTimeout(() => {
    updateMenuItems()
    observeSections()
  }, 0)
})

watchEffect(() => {
  setTimeout(() => {
    updateMenuItems()
    observeSections()
  }, 0)
})
</script>

<template>
  <nav class="menu" :class="menuClass">
    <ul class="menu" :class="directionClass">
      <li
        v-for="item in menuItems"
        class="item"
        :class="{ active: activeSection === item.id }"
        :key="item.id"
      >
        <a :href="item.link">{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
</style>
