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

<style lang="scss" scoped>// #Sheet
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
