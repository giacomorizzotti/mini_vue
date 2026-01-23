<script setup>
import { ref, computed } from 'vue'
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass, menuClose } = useMenuState()
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
      <li v-if="menuItems" v-for="item in menuItems" class="item">
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
