<script setup>
import { useMenuState } from '@/mini/composables/useMenuState'
const { isMenuOpen, menuToggle } = useMenuState()

function processedMenuToggle() {
    if (!isMenuOpen.value===true) {window.scrollTo(0,0)}
    menuToggle()
}
</script>

<template>
  <div
    id="menu-toggle"
    :class="{ clicked: isMenuOpen }"
    @click="processedMenuToggle"
  >
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
</template>

<style lang="scss" scoped>
</style>
