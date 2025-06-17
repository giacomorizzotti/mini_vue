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
// brand
header#header {
  #brand, .brand {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    min-height: calc( (var(--padding) * 2 ) + var(--logo-height) );
    a {
      display: inline-block;
      .logo, .header-logo {
        transition: all 0.3s ease;
        min-height: var(--logo-height);
        height: var(--logo-height);
        width: auto;
      }
    }
    .site-title {
      display: inline-block;
      margin: 0 var(--margin) 0 0;
      position: relative;
      line-height: 1!important;
    }
  }
}
</style>

<style lang="scss">
body.top {
  header#header {
    &.neg, &.inv, &.top-neg, &.top-inv, &.top-bk, &.top-col {
      #brand, .brand {
        color: var(--white);
        a {
          .logo, .header-logo {
            filter: brightness(0) invert(1);
          }
          .site-title {
            color: var(--white);
          }
        }
        .site-description {
          color: var(--white);
        }
      }
    }
  }
  .open-menu {
    header#header {
      &.neg, &.inv, &.top-neg, &.top-inv, &.scroll-neg, &.scroll-inv {
        background: var(--transp);
      }
    }
    #brand, .brand {
      img.logo {
        filter: brightness(0) invert(1);
      }
      .site-title, .header-logo {
        color:var(--white);
      }
      .site-description {
        color: var(--white);
      }
    }
  }
}
body.scroll, body.scrolled {
  header#header {
    #brand, .brand {
      min-height: calc( (var(--padding) * 2 ) + var(--scroll-logo-height) );
      a {
        .logo, .header-logo {
          min-height: var(--scroll-logo-height);
          height: var(--scroll-logo-height);
        }
      }
    }
    &.neg, &.inv, &.scroll-neg, &.scroll-inv, &.scroll-bk, &.scroll-col {
      #brand, .brand {
        color: var(--white);
        a {
          .logo, .header-logo {
            filter: brightness(0) invert(1);
          }
          .site-title {
            color: var(--white);
          }
        }
        .site-description {
          color: var(--white);
        }
      }
    }
  }
}
</style>
