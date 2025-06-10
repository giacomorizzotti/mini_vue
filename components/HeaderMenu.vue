<script setup>
import { ref, computed } from 'vue'
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import MenuToggle from '@/mini/components/MenuToggle.vue';
import Menu from '@/mini/components/PageMenu.vue';
import { getMenuStateClass } from '@/mini/composables/menuState'
import { getScrollClass } from '@/mini/composables/scrollState'

const props = defineProps({
  menuToggle: {
    type: [Boolean],
    default: true
  },
  invert: {
    type: [Boolean],
    default: null
  }
})

const scrollClass = getScrollClass()

const headerMenuClasses = computed(() => {
  const menuStateClass = getMenuStateClass()
  const classes = [ 'p-0', scrollClass.value, menuStateClass.value ]
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})

</script>

<template>
  <Box id="head-menus" :class="headerMenuClasses">
    <Boxes class="g-0 align-items-center">
      <Box id="header-menu-box md">
        <Menu id="page-menu" :invert="props.invert"/>
      </Box>
      <Box>
        <MenuToggle v-if="menuToggle"/>
      </Box>
    </Boxes>
  </Box>
</template>

<style lang="scss" scoped>
</style>
