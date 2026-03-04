<script setup>
import { computed } from 'vue'
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()
  const props = defineProps({
    side: {
      type: [Number, String],
      default: null
    },
    open: {
      type: Boolean,
      default: false
    }
  })
  const mainClass = computed(() => {
    const classes = []
    if (props.open === true) {
      classes.push('open')
    }
    return classes
  })
</script>

<template>
  <main :class="[ scrollClass, menuStateClass, mainClass ]">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
</style>
