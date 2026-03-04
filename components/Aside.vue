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

  const asideId = computed(() => {
    const id = []
    if (props.side === 'left' || props.side === 'l') {
      id.push('side-left')
    } else if (props.side === 'right' || props.side === 'r') {
      id.push('side-right')
    }
    return id
  })
  const asideClass = computed(() => {
    const classes = []
    if (props.open === true) {
      classes.push('open')
    }
    return classes
  })

</script>

<template>
  <aside :id="asideId" :class="[scrollClass, menuStateClass, asideClass]">
    <slot />
  </aside>
</template>

<style lang="scss" scoped>
</style>
