<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
import { PageSearch } from '@iconoir/vue'
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
  const sections = document.querySelectorAll('section.page-menu')
  menuItems.value = Array.from(sections).map(section => ({
    title: section.getAttribute('title'),
    link: '#' + section.id,
    id: section.id
  }))
}

// Intersection Observer to track active section
let observer = null
function observeSections() {
  if (observer) observer.disconnect()
  const sections = document.querySelectorAll('section.page-menu')
  if (!sections.length) return
  observer = new window.IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      activeSection.value = visible[0]?.target.id ?? null
    },
    {
      threshold: [0.3, 0.6, 1.0],
      rootMargin: '0px 0px -40% 0px'
    }
  )
  sections.forEach(section => observer.observe(section))
}

async function refresh() {
  await nextTick()
  updateMenuItems()
  observeSections()
}

const route = useRoute()
watch(() => route.path, refresh)

onMounted(refresh)
onUnmounted(() => { if (observer) observer.disconnect() })
</script>

<template>
  <nav id="page-menu" class="menu" :class="menuClass">
    <ul class="menu page-menu m-0" :class="directionClass">
      <li class="icon flex flex-column">
        <PageSearch width="20px" height="20px"style="vertical-align: middle;"/>
        <span class="XXS color-text">IN PAGE</span>
      </li>
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
#page-menu ul.page-menu {
  @media screen and (min-width: 768px) {
    background-color: rgba(255, 255, 255, 0.85);
    border: 1px solid var(--white);
    border-radius: 5px;
    overflow: hidden;
  }
  li.icon {
    justify-content: center;
    padding: calc(var(--padding) * 0.5) var(--padding) 0;
    margin: 0 0 0 var(--margin);
    @media screen and (min-width: 768px) {
      margin: 0;
    }
  }
  li a {
    padding: calc(var(--padding) * 0.5);
    &::after {
      bottom: 2px;
    }
  }
}
</style>
