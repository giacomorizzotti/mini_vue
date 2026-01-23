<script setup>
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()
</script>

<template>
  <main :class="[ scrollClass, menuStateClass ]">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
</style>
