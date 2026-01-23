<script setup>
import { computed } from 'vue'
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()
</script>

<template>
  <div 
    id="sheet"
    :class="[ scrollClass, menuStateClass ]"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
</style>
