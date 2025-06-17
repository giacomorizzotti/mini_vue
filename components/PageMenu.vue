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
// page menu

#page-menu {
  margin: 0;
  ul {
    display: flex;
    position: fixed;
    transform: rotate(-90deg) translate(0, -100%);
    flex-flow: row-reverse wrap;
    justify-content: flex-start;
    transform-origin: top right;
    width: 100vh;
    top: 0;
    right: 0;
    height: auto;
    padding-right: calc((var(--menu-toggle-height)) + (var(--padding) * 2) + (var(--padding) * 1));
    @media only screen and (min-width: 768px) {
      position: relative;
      transform: none;
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-end;
      width: auto;
      top: 0;
      right: 0;
      height: auto;
      padding-right: var(--padding);
    }
    li {
      &.item, &.menu-item {
        font-weight: 300;
        margin-right: calc( var(--margin) * 0.5 );
        a {
          padding: calc(var(--padding) * 0.5) var(--padding);
        }
      }
      &.menu-icon {
        color: var(--main-color-dark);
        padding: var(--padding);
        border: 5px solid var(--main-color-dark);
        @media only screen and (min-width: 768px) {
          background-color: transparent;
          color: var(--grey);
          padding: calc(var(--padding)*.5) calc(var(--padding)*.75);
          border: 0;
        }
      }
    }
  }
}
</style>
<style lang="scss">
body.top {
    header#header {     
        &.open-menu, &.top-neg, &.top-inv, &.top-bk, &.top-col {
            #page-menu ul li {
                &.item, &.menu-item {
                    a {
                        color: var(--white);
                    }
                }
            }
        }
    }
}
body.scroll, body.scrolled {
    header#header {
        &.scroll-neg, &.scroll-inv, &.scroll-bk, &.scroll-col {
            #page-menu ul li {
                &.item, &.menu-item {
                    a {
                    color: var(--white);
                    }
                }
            }
        }
    }
}
</style>
