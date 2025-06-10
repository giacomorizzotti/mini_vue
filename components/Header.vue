<script setup>
import { ref, computed } from 'vue'
import { getMenuStateClass } from '@/mini/composables/menuState'
import { getScrollClass } from '@/mini/composables/scrollState'

const props = defineProps({
  fixed: {
    type: [Boolean],
    default: true
  },
  invert: {
    type: [Boolean],
    default: null
  },
})

const scrollClass = getScrollClass()

const headerClasses = computed(() => {
  const menuStateClass = getMenuStateClass()
  const classes = [ scrollClass.value, menuStateClass.value ]
  if (props.fixed === true) classes.push("fixed")
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})

</script>

<template>
<header id="header" :class="headerClasses">
  <slot/>
</header>
</template>

<style lang="scss" scoped>
header#header {
  transition: background-color 0.15s ease-out;
  &.fixed {
    position: fixed;
    z-index:99;
    width: 100%;
  }
  &.open-menu {
    &.scrolled {
      background-color: var(--sheet-color);
    }
  }
}
</style>
