<script setup>
import { ref, computed } from 'vue'
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

const props = defineProps({
  logo: {
    type: [String],
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
    type: [Boolean],
    default: null
  }
})

const headerBrandClasses = computed(() => {
  const classes = [ 'p-0', scrollClass.value, menuStateClass.value ]
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})

</script>

<template>
  <Box id="brand" :class="headerBrandClasses">
    <Boxes class="g-0 align-items-center">
      <Box>
        <router-link :to="{ name: 'home' }" class="">
            <img :src="logo" class="header-logo" alt="logo"/>
        </router-link>
      </Box>
      <Box>
        <router-link :to="{ name: 'home' }" class="">
          <h3 class="site-title">
            {{ title }}
          </h3>
        </router-link>
      </Box>
    </Boxes>
  </Box>
</template>

<style lang="scss" scoped>
#brand a {
  display: flex;
  align-items: center;
  height: 100%;
}
.open-menu {
  &.scrolled {
    background-color: var(--sheet-color);
  }
  .header-logo {
    filter: brightness(0) invert(1);
  }
  .site-title {
    color: var(--white);
  }
}
.header-logo {
  transition: filter 0.2s ease-out;
  height: var(--logo-height);
  width: auto;
}
.site-title {
  transition: color 0.2s ease-out;
  margin: 0;
}
.invert {
  .header-logo {
    filter: brightness(0) invert(1);
  }
}
</style>
