<script setup>
import { computed, watch } from 'vue'
import { useMenuState } from '@/mini/composables/useMenuState'

const { isMenuOpen, menuStateClass, menuClose } = useMenuState()

const props = defineProps({
  menuItems: {
    type: [Array],
    default: null
  },
  menuCloseOnClick: {
    type: [Boolean],
    default: false
  },
  menuCloseOnScroll: {
    type: [Boolean],
    default: false
  },
  direction: {
    type: [String],
    default: 'column'
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const directionClass = computed(() => {
  const classes = []
  if (props.direction === 'row') {
    classes.push('row')
  } else {
    classes.push('column')
  }
  return classes
})

const visibleMenuItems = computed(() => {
  if (!props.menuItems) return []

  return props.menuItems.filter(item => {
    if (item?.requiresAuth && !props.isAuthenticated) {
      return false
    }

    if (item?.guestOnly && props.isAuthenticated) {
      return false
    }

    return true
  })
})

// menuCloseOnScroll: arm a one-shot scroll listener each time the menu opens,
// delayed by 150ms so the click/tap that opened it doesn't immediately trigger
// it. { once: true } self-removes after the first real scroll — reopening the
// menu re-arms it. A persistent listener caused a double-click-to-open bug.
watch(isMenuOpen, (open) => {
  if (open && props.menuCloseOnScroll) {
    setTimeout(() => {
      window.addEventListener('scroll', menuClose, { passive: true, once: true })
    }, 150)
  }
})

const processedMenuClose = (event) => {
  // Only scroll back to top for an actual navigation (a real <a>, e.g. a
  // RouterLink or a Button rendered with its `link` prop) inside the menu
  // -- a non-navigating action nested in a menu (a toggle button, etc.)
  // would otherwise yank the page to the top on every click, since this
  // handler sits on the menu's <ul> and catches every click bubbling
  // through it, not just link clicks.
  if (event.target.closest('a')) {
    window.scrollTo(0,0)
  }
  if (props.menuCloseOnClick === true) {
    menuClose()
  }
}

</script>

<template>
  <nav class="menu" :class="menuStateClass">
    <ul class="menu" :class="directionClass" @click="processedMenuClose">
      <li v-if="menuItems" v-for="item in visibleMenuItems" :key="item.routeName || item.link || item.title" class="item">
        <router-link
          :to="{ name: item.routeName }"
          :href="item.link"
          :target="item.target"
        >{{ item.title }}</router-link>
      </li>
      <slot v-else/>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
</style>
