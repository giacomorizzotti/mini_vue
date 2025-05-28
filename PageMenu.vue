<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { menuState } from '@/composables/menuState'
const { isMenuOpen } = menuState()

const props = defineProps({
  menuToggleOnClick: {
    type: [Boolean],
    default: false
  },
  direction: {
    type: [String],
    default: 'row'
  }
})

const directionClass = computed(() => {
  const classes = []
  if (props.direction === 'row') {
    classes.push('row')
  }
  return classes
})

const menuItems = ref([])

function updateMenuItems() {
  menuItems.value = []
  const sections = document.querySelectorAll('section.page-menu')
  if (sections.length > 0) {
    for (let section of sections) {
      menuItems.value.push({
        title: section.getAttribute('title'),
        link: '#' + section.id,
      })
    }
  }
}

const route = useRoute()

onMounted(() => {
  setTimeout(updateMenuItems, 0)
})

watch(
  () => route.fullPath,
  () => {
    // Wait for DOM update after route change
    setTimeout(updateMenuItems, 0)
  }
)
</script>

<template>
  <nav class="menu" :class="{ 'open-menu': isMenuOpen }">
    <ul class="menu" :class="directionClass">
      <li v-for="item in menuItems" class="item">
        <a 
          :href="item.link"
        >{{ item.title }}</a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
nav.menu {
  display: flex;
  margin: var(--margin) 0;
  ul.menu {
    list-style-type: none;
    display: flex;
    margin: 0;
    padding: 0 var(--padding);
    flex-flow: column nowrap;
    &.column {
      flex-flow: column nowrap;
    }
    &.row {
      flex-flow: row wrap;
    }
    li.item, li.menu-item {
      display: block;
      font-weight: 700;
      font-size: var(--h5);
      line-height: 1.5;
      margin:0;
      background: transparent;
      padding:0;
      @media only screen and (min-width: 576px) {
        font-size: var(--h4);
      }
      @media only screen and (min-width: 768px) {
        font-size: var(--h6);
        padding: calc(var(--padding)*.5) calc(var(--padding)*.75);
      }
      a {
        display: block;
        position: relative;
        padding: var(--padding);
        margin: calc(var(--margin) * 0.5 ) 0;
        @media only screen and (min-width: 576px) {
          padding: calc(var(--padding) * 0.75 );
          margin: calc(var(--margin) * 0.75 ) 0;
        }
        @media only screen and (min-width: 768px) {
          color: var(--black);
          display: inline-block;
          margin: 0;
          padding: 0;
        }
        &::after {
          content:"";
          display: block;
          position: absolute;
          height: 2px;
          width: 0;
          background-color: var(--white);
          bottom: -2px;
          left:0;
          transition: background-color 0.25s ease, width 0.25s ease;
          border-radius: 2px;
          @media only screen and (min-width: 768px) {
            background: var(--link-link-color);
          }
        }
      }
      &.active > a, &.selected > a, &.router-link-active > a, a.active, a.selected, a.router-link-active {
        background-color: var(--link-hover-color);
        color: var(--white);
        @media only screen and (min-width: 768px) {
          color: var(--link-hover-color);
          background-color: transparent;
        }
        &::after {
          width: 0;
          background-color: var(--link-hover-color);
          @media only screen and (min-width: 768px) {
            width: 100%;
            background-color: var(--link-hover-color);
          }
        }
      }
      &:hover > a {
        background-color: var(--link-color);
        color: var(--white);
        @media only screen and (min-width: 768px) {
          color: var(--link-color);
          background-color: transparent;
        }
        &::after {
          width: 0;
          background-color: var(--link-color);
          @media only screen and (min-width: 768px) {
            width: 100%;
            background-color: var(--link-color);
          }
        }
      }
    }
  }
}
header#header, aside {
  nav.menu {
    &.open-menu {
      ul.menu {
        li.item {
          a {
            color: var(--white);
            &::after {
              background: var(--white);
            }
          }
          &.active > a, &.selected > a, &.router-link-active > a, a.active, a.selected, a.router-link-active {
            background-color: var(--light-grey);
            color: var(--white);
            @media only screen and (min-width: 768px) {
              color: var(--light-grey);
              background-color: transparent;
            }
            &::after {
              width: 0;
              background-color: var(--light-grey);
              @media only screen and (min-width: 768px) {
                width: 100%;
                background-color: var(--light-grey);
              }
            }
          }
          &:hover > a {
            color: var(--link-color);
            background-color: transparent;
            &::after {
              width: 100%;
              background-color: var(--link-color);
            }
          }
        }
      }
    }
  }
}
// main menu
#main-menu {
  li.item, li.menu-item {
    font-size: var(--h4);
    a {
      color: var(--white);
      &::after {
        height: 4px;
        bottom: -4px;
      }
    }
    ul.sub-menu {
      li {
        font-size: var(--h4);
      }
    }
  }
}
</style>
