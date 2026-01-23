<<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

const props = defineProps({
  logo: {
    type: [null, String],
    default: 'https://mini.uwa.agency/img/brand/mini_emblem.svg'
  },
  title: {
    type: [String]
  },
  menuToggle: {
    type: [Boolean],
    default: true
  },
  invert: {
    type: [Boolean, String],
    default: null
  },
  logoFrame: {
    type: [Boolean],
    default: false
  },
})

const headerBrandClasses = computed(() => {
  const classes = [ 'p-0', scrollClass.value, menuStateClass.value ]
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})
const headerBrandLogoBoxClasses = computed(() => {
  const classes = [ 'logo-box' ]
  if (props.logoFrame === true) classes.push("white-bg")
  return classes
})

</script>

<template>
  <Box id="brand" :class="headerBrandClasses">
    <Boxes class="g-0 align-items-center">
      <Box :class="headerBrandLogoBoxClasses" v-if="logo">
        <RouterLink v-if="logo" :to="{ name: 'home' }" class="">
            <img :src="logo" class="header-logo" alt="logo"/>
        </RouterLink>
      </Box>
      <Box class="title-box" v-if="title">
        <RouterLink :to="{ name: 'home' }" class="">
          <h3 class="site-title" v-html="title"/>
        </RouterLink>
      </Box>
    </Boxes>
  </Box>
</template>

<style lang="scss" scoped>
</style>
