<script setup>
import { computed } from 'vue'
import { useMenuState } from '@/mini/composables/useMenuState'
import { useAuthStore } from '@/mini/stores/auth'

const { menuStateClass, menuClose } = useMenuState()
const authStore = useAuthStore()

const props = defineProps({
  menuItems: {
    type: [Array],
    default: null
  },
  menuCloseOnClick: {
    type: [Boolean],
    default: false
  },
  direction: {
    type: [String],
    default: 'column'
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
    if (item?.requiresAuth && !authStore.isAuthenticated) {
      return false
    }

    if (item?.guestOnly && authStore.isAuthenticated) {
      return false
    }

    return true
  })
})

const processedMenuClose = () => {
  window.scrollTo(0,0)
  if (props.menuCloseOnClick === true) {
    menuClose()
  }
}

</script>

<template>
  <nav class="menu" :class="menuStateClass">
    <ul class="menu" :class="directionClass">
      <li v-if="menuItems" v-for="item in visibleMenuItems" :key="item.routeName || item.link || item.title" class="item">
        <router-link 
          :to="{ name: item.routeName }"
          :href="item.link"
          :target="item.target" 
          @click="processedMenuClose"
        >{{ item.title }}</router-link>
      </li>
      <slot v-else/>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
</style>
