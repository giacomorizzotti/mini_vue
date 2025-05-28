<script setup>
import Container from '@/mini/Container.vue'
import Boxes from '@/mini/Boxes.vue';
import Box from '@/mini/Box.vue';
import MenuToggle from '@/mini/MenuToggle.vue';
import Menu from '@/mini/PageMenu.vue';
import { ref } from 'vue'
import HeaderMenuBox from './HeaderMenuBox.vue';
import { menuState } from '@/composables/menuState'
const { isMenuOpen } = menuState()
import { computed } from 'vue'
import { useScroll } from '@vueuse/core'
const scroll = useScroll(window)

const props = defineProps({
  logoUrl: {
    type: [String],
    default: 'https://mini.uwa.agency/img/brand/mini_emblem.svg'
  },
  title: {
    type: [String],
    default: 'mini'
  }
})

const sheetClasses = computed(() => {
  const classes = []
  // Scroll
  scroll.arrivedState.top ? classes.push('top') : classes.push('scrolled')
  // Menu open
  if (isMenuOpen.value == true) classes.push('open-menu')
  return classes
})

</script>

<template>
<header id="header" class="fixed" :class="sheetClasses">
  <Container>
    <Boxes class="justify-content-between align-items-center">
      <Box id="brand" class="p-0">
        <Boxes class="g-0 align-items-center">
          <Box>
            <router-link :to="{ name: 'home' }" class="">
                <img :src="logoUrl" class="header-logo" alt="logo"/>
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
      <Box id="head-menus" class="p-0">
        <Boxes class="g-0 align-items-center">
          <HeaderMenuBox>
            <Menu id="page-menu" />
          </HeaderMenuBox>
          <Box>
            <MenuToggle/>
          </Box>
        </Boxes>
      </Box>
    </Boxes>
  </Container>
</header>
</template>

<style lang="scss" scoped>
header#header {
  transition: background-color 0.15s ease-out;
  #brand a {
    display: flex;
    align-items: center;
    height: 100%;
  }
  &.fixed {
    position: fixed;
    z-index:99;
    width: 100%;
  }
  &.open-menu {
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
}
</style>
