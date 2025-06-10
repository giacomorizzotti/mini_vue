<script setup>
import { computed } from 'vue'
import { getMenuStateClass } from '@/mini/composables/menuState'
import { getScrollClass } from '@/mini/composables/scrollState'

const scrollClass = getScrollClass()

const sheetClasses = computed(() => {
  const menuStateClass = getMenuStateClass()
  const classes = [ scrollClass.value, menuStateClass.value ]
  return classes
})

</script>

<template>
  <div 
    id="sheet"
    :class="sheetClasses"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
#sheet {
  display: flex;
  flex-flow: column wrap;
  align-items: stretch;
  background: var(--sheet-color);
  transition: padding 0.2s ease-out;
  min-height: 100vh;
  overflow: hidden;
  @media only screen and (min-width: 992px) {
    flex-flow: row wrap;
    justify-content: flex-end;
    align-items: stretch;
  }
  &.open-menu {
    padding-top: calc((var(--menu-toggle-height)) + var(--margin) * 2 );
  }
}
</style>
