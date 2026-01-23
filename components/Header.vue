<script setup>
import { ref, computed } from 'vue'
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

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

const headerClasses = computed(() => {
  const classes = [menuStateClass.value, scrollClass.value]
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
</style>
