<script setup>
import { ref, computed } from 'vue'
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import MenuToggle from '@/mini/components/MenuToggle.vue';
import Menu from '@/mini/components/PageMenu.vue';
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

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


const headerMenuClasses = computed(() => {
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
